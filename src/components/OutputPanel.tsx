import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCopy, FiCheck, FiAlertCircle, FiMaximize2, FiMinimize2, FiPlay, FiPause } from 'react-icons/fi';
import { DecodeResult } from '../types';
import { generateMorseAudio } from '../utils/decoders';

interface OutputPanelProps {
  results: DecodeResult[];
}

function OutputPanel({ results }: OutputPanelProps) {
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const audioSourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const playMorseCode = async (morseCode: string, index: number) => {
    try {
      // 如果已經在播放，停止當前播放
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
        if (isPlaying === index) {
          setIsPlaying(null);
          return;
        }
      }

      const audioBuffer = await generateMorseAudio(morseCode);
      const audioContext = new AudioContext();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      // 保存音頻源的引用
      audioSourceRef.current = source;
      setIsPlaying(index);

      // 播放完成後重置狀態
      source.onended = () => {
        setIsPlaying(null);
        audioSourceRef.current = null;
      };

      source.start();
    } catch (error) {
      console.error('Failed to play morse code:', error);
      setIsPlaying(null);
    }
  };

  // 格式化輸出結果
  const formatResult = (result: DecodeResult) => {
    if (result.method === 'morse') {
      const [decodedText, morseCode] = result.result.split('\n');
      return (
        <div className="space-y-2">
          <div className="font-mono text-sm p-2 bg-gray-50 dark:bg-dark-hover rounded">
            <span className="text-gray-500 dark:text-gray-400">解密結果：</span>
            <span className="text-gray-800 dark:text-dark-text">{decodedText}</span>
          </div>
          <div className="font-mono text-sm p-2 bg-gray-50 dark:bg-dark-hover rounded">
            <span className="text-gray-500 dark:text-gray-400">摩斯密碼：</span>
            <span className="text-gray-800 dark:text-dark-text">{morseCode}</span>
          </div>
        </div>
      );
    }
    return (
      <pre className="whitespace-pre-wrap break-all">{result.result}</pre>
    );
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">處理結果</h2>
      </div>

      <div className="p-4 space-y-4">
        <AnimatePresence>
          {results.map((result, index) => (
            <motion.div
              key={`${result.method}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`rounded-lg border-2 overflow-hidden transition-colors ${
                result.status === 'success'
                  ? 'border-green-100 dark:border-green-900/30'
                  : 'border-red-100 dark:border-red-900/30'
              }`}
            >
              <div
                className={`px-4 py-3 flex items-center justify-between ${
                  result.status === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {result.status === 'success' ? (
                    <FiCheck className="w-5 h-5 text-green-500 dark:text-green-400" />
                  ) : (
                    <FiAlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                  )}
                  <span className="font-medium text-gray-700 dark:text-dark-text">
                    {result.method}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {result.status === 'success' && (
                    <>
                      {result.method === 'morse' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => playMorseCode(result.result.split('\n')[1], index)}
                          className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-black/10 transition-colors"
                          title={isPlaying === index ? '停止播放' : '播放摩斯密碼'}
                        >
                          {isPlaying === index ? (
                            <FiPause className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                          ) : (
                            <FiPlay className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCopy(result.result, index)}
                        className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-black/10 transition-colors"
                        title="複製結果"
                      >
                        {copiedIndex === index ? (
                          <FiCheck className="w-5 h-5 text-green-500 dark:text-green-400" />
                        ) : (
                          <FiCopy className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </motion.button>
                    </>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setExpandedResult(expandedResult === index ? null : index)}
                    className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-black/10 transition-colors"
                    title={expandedResult === index ? '收合' : '展開'}
                  >
                    {expandedResult === index ? (
                      <FiMinimize2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <FiMaximize2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </motion.button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {(expandedResult === index || results.length === 1) && (
                  <motion.div
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={{
                      expanded: { height: 'auto', opacity: 1 },
                      collapsed: { height: 0, opacity: 0 }
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4">
                      <div
                        className={`font-mono text-sm p-3 rounded-lg ${
                          result.status === 'success'
                            ? 'bg-gray-50 dark:bg-dark-hover text-gray-800 dark:text-dark-text'
                            : 'bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {formatResult(result)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OutputPanel; 