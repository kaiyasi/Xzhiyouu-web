import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import DecodePanel from './components/DecodePanel';
import OutputPanel from './components/OutputPanel';
import ThemeToggle from './components/ThemeToggle';
import { DecodeMethod, DecodeResult, OperationType } from './types';
import { decodeWithMethod } from './utils/decoders';

function App() {
  const [input, setInput] = useState('');
  const [selectedMethods, setSelectedMethods] = useState<DecodeMethod[]>([]);
  const [results, setResults] = useState<DecodeResult[]>([]);
  const [isDecoding, setIsDecoding] = useState(false);
  const [operationType, setOperationType] = useState<OperationType>('decode');

  const handleDecode = async () => {
    if (!input.trim() && selectedMethods.every(m => m !== 'morse')) {
      showToast('請輸入要處理的內容！');
      return;
    }

    if (selectedMethods.length === 0) {
      showToast(`請選擇至少一種${operationType === 'encode' ? '加密' : '解密'}方式！`);
      return;
    }

    setIsDecoding(true);
    const newResults: DecodeResult[] = [];

    for (const method of selectedMethods) {
      try {
        const result = await decodeWithMethod(method, input, {}, operationType);
        newResults.push({
          method,
          result,
          status: 'success'
        });
      } catch (error) {
        newResults.push({
          method,
          result: error instanceof Error ? error.message : '處理失敗',
          status: 'error'
        });
      }
    }

    setResults(newResults);
    setIsDecoding(false);
  };

  const handleWavFile = async (audioBuffer: AudioBuffer) => {
    // 將 WAV 檔案轉換為摩斯密碼
    const morseCode = await analyzeMorseFromAudio(audioBuffer);
    if (morseCode) {
      setInput(morseCode);
      if (!selectedMethods.includes('morse')) {
        setSelectedMethods([...selectedMethods, 'morse']);
      }
    }
  };

  const analyzeMorseFromAudio = async (audioBuffer: AudioBuffer): Promise<string> => {
    // 獲取音頻數據
    const audioData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // 設定閾值和時間參數（調整這些參數以提高準確性）
    const amplitudeThreshold = 0.05; // 降低音量閾值以捕捉更多信號
    const dotDuration = sampleRate * 0.1; // 點的持續時間（樣本數）
    const dashDuration = sampleRate * 0.3; // 劃的持續時間（樣本數）
    const tolerance = sampleRate * 0.05; // 時間容差（樣本數）
    const wordGap = sampleRate * 0.7; // 單詞間隔（樣本數）
    const charGap = sampleRate * 0.3; // 字符間隔（樣本數）

    let morseCode = '';
    let isSignal = false;
    let signalStart = 0;
    let signalLength = 0;
    let lastSignalEnd = 0;
    let signals: { duration: number; gap: number }[] = [];

    // 使用 RMS（均方根）來計算音量
    const calculateRMS = (start: number, length: number) => {
      let sum = 0;
      for (let i = start; i < start + length && i < audioData.length; i++) {
        sum += audioData[i] * audioData[i];
      }
      return Math.sqrt(sum / length);
    };

    // 第一遍：收集所有信號
    for (let i = 0; i < audioData.length; i++) {
      const rms = calculateRMS(i, Math.floor(sampleRate * 0.01)); // 10ms 窗口
      
      if (rms > amplitudeThreshold && !isSignal) {
        // 信號開始
        isSignal = true;
        signalStart = i;
      } else if (rms <= amplitudeThreshold && isSignal) {
        // 信號結束
        isSignal = false;
        signalLength = i - signalStart;
        
        if (lastSignalEnd > 0) {
          const gap = signalStart - lastSignalEnd;
          signals.push({ duration: signalLength, gap });
        } else {
          signals.push({ duration: signalLength, gap: 0 });
        }
        
        lastSignalEnd = i;
      }
    }

    // 計算平均信號持續時間來動態調整閾值
    if (signals.length > 0) {
      const avgDuration = signals.reduce((sum, s) => sum + s.duration, 0) / signals.length;
      const dotThreshold = avgDuration * 0.6; // 60% 的平均持續時間作為點和劃的分界

      // 第二遍：解碼信號
      let lastGap = 0;
      signals.forEach((signal, index) => {
        // 添加適當的間隔
        if (index > 0) {
          if (signal.gap > wordGap) {
            morseCode += ' / ';
          } else if (signal.gap > charGap) {
            morseCode += ' ';
          }
        }

        // 解碼信號
        if (signal.duration < dotThreshold) {
          morseCode += '.';
        } else {
          morseCode += '-';
        }
      });
    }

    return morseCode;
  };

  const clearAll = () => {
    setInput('');
    setSelectedMethods([]);
    setResults([]);
    showToast('已清除所有內容！');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-dark-text transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InputPanel
              input={input}
              onInputChange={setInput}
              onWavFile={handleWavFile}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DecodePanel
              selectedMethods={selectedMethods}
              onMethodsChange={setSelectedMethods}
              onDecode={handleDecode}
              onClear={clearAll}
              isDecoding={isDecoding}
              operationType={operationType}
              onOperationTypeChange={setOperationType}
            />
          </motion.div>
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <OutputPanel results={results} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ThemeToggle />
    </div>
  );
}

function showToast(message: string) {
  // 實作 toast 通知
  console.log(message);
}

export default App; 