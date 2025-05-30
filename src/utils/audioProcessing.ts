import { DecoderOptions } from '../types';

export interface AudioAnalysisResult {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  format: string;
  spectrumData?: Float32Array;
  morseCode?: string;
  hiddenData?: string;
}

export async function analyzeAudio(
  file: File,
  options?: DecoderOptions
): Promise<AudioAnalysisResult> {
  const audioContext = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const result: AudioAnalysisResult = {
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    numberOfChannels: audioBuffer.numberOfChannels,
    format: file.type
  };
  
  // 頻譜分析
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  
  analyser.getFloatFrequencyData(dataArray);
  result.spectrumData = dataArray;
  
  // 摩斯密碼檢測
  if (options?.variant === 'morse') {
    result.morseCode = await detectMorseCode(audioBuffer);
  }
  
  // 隱寫術檢測
  if (options?.steganoMethod) {
    result.hiddenData = await detectHiddenData(audioBuffer, options);
  }
  
  return result;
}

async function detectMorseCode(audioBuffer: AudioBuffer): Promise<string> {
  const threshold = 0.1; // 信號閾值
  const dotDuration = 0.1; // 點的持續時間（秒）
  const dashDuration = 0.3; // 劃的持續時間（秒）
  
  const data = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  let morseCode = '';
  let isSignal = false;
  let signalStart = 0;
  let signalDuration = 0;
  
  // 檢測信號
  for (let i = 0; i < data.length; i++) {
    const amplitude = Math.abs(data[i]);
    
    if (amplitude > threshold && !isSignal) {
      isSignal = true;
      signalStart = i;
    } else if (amplitude <= threshold && isSignal) {
      isSignal = false;
      signalDuration = (i - signalStart) / sampleRate;
      
      // 判斷是點還是劃
      if (signalDuration >= dashDuration) {
        morseCode += '-';
      } else if (signalDuration >= dotDuration) {
        morseCode += '.';
      }
      
      // 檢測字符間隔
      if (i - signalStart > sampleRate * 0.7) {
        morseCode += ' ';
      }
    }
  }
  
  return decodeMorseCode(morseCode);
}

function decodeMorseCode(morse: string): string {
  const morseMap: { [key: string]: string } = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
    '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
    '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
    '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
    '--..': 'Z', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
    '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
    '-----': '0', '.-.-.-': '.', '--..--': ',', '..--..': '?'
  };

  return morse
    .trim()
    .split(' ')
    .map(code => morseMap[code] || '')
    .join('');
}

async function detectHiddenData(
  audioBuffer: AudioBuffer,
  options: DecoderOptions
): Promise<string> {
  const data = audioBuffer.getChannelData(0);
  let hiddenData = '';
  
  switch (options.steganoMethod) {
    case 'lsb':
      // LSB 隱寫
      let bits = '';
      for (let i = 0; i < data.length; i++) {
        const sample = Math.abs(data[i]);
        const bit = Math.round(sample * 10) % 2;
        bits += bit;
        
        if (bits.length === 8) {
          const charCode = parseInt(bits, 2);
          if (charCode === 0) break;
          hiddenData += String.fromCharCode(charCode);
          bits = '';
        }
      }
      break;
      
    case 'spectrum':
      // 頻譜隱寫
      const analyser = new AudioContext().createAnalyser();
      analyser.fftSize = 2048;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      
      const source = new AudioContext().createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      
      analyser.getFloatFrequencyData(dataArray);
      
      // 檢測特定頻率範圍的異常
      for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > -30) { // 閾值
          hiddenData += String.fromCharCode(i % 128);
        }
      }
      break;
      
    case 'echo':
      // 回聲隱寫
      const echoDelay = 0.1; // 回聲延遲（秒）
      const sampleDelay = Math.round(echoDelay * audioBuffer.sampleRate);
      
      for (let i = sampleDelay; i < data.length; i++) {
        const echo = data[i] - data[i - sampleDelay];
        if (Math.abs(echo) > 0.1) { // 閾值
          hiddenData += '1';
        } else {
          hiddenData += '0';
        }
        
        if (hiddenData.length % 8 === 0) {
          const charCode = parseInt(hiddenData.slice(-8), 2);
          if (charCode === 0) break;
        }
      }
      break;
      
    default:
      throw new Error('不支援的隱寫方法');
  }
  
  return hiddenData;
}

// 音頻格式轉換
export async function convertAudioFormat(
  file: File,
  targetFormat: string
): Promise<Blob> {
  const audioContext = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // 創建離線音頻上下文
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start();
  
  const renderedBuffer = await offlineContext.startRendering();
  
  // 將 AudioBuffer 轉換為指定格式
  const mediaStreamDestination = audioContext.createMediaStreamDestination();
  const source2 = audioContext.createBufferSource();
  source2.buffer = renderedBuffer;
  source2.connect(mediaStreamDestination);
  
  const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
    mimeType: `audio/${targetFormat}`
  });
  
  return new Promise((resolve, reject) => {
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: `audio/${targetFormat}` });
      resolve(blob);
    };
    
    mediaRecorder.onerror = (e) => {
      reject(new Error('音頻轉換失敗'));
    };
    
    mediaRecorder.start();
    source2.start();
    
    setTimeout(() => {
      mediaRecorder.stop();
    }, renderedBuffer.duration * 1000 + 100);
  });
}

// 音頻濾波
export async function filterAudio(
  file: File,
  options: {
    lowCut?: number;
    highCut?: number;
    gain?: number;
  }
): Promise<Blob> {
  const audioContext = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // 創建離線音頻上下文
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  
  // 創建濾波器
  if (options.lowCut) {
    const lowpass = offlineContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = options.lowCut;
    source.connect(lowpass);
    lowpass.connect(offlineContext.destination);
  }
  
  if (options.highCut) {
    const highpass = offlineContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = options.highCut;
    source.connect(highpass);
    highpass.connect(offlineContext.destination);
  }
  
  if (options.gain) {
    const gainNode = offlineContext.createGain();
    gainNode.gain.value = options.gain;
    source.connect(gainNode);
    gainNode.connect(offlineContext.destination);
  }
  
  if (!options.lowCut && !options.highCut && !options.gain) {
    source.connect(offlineContext.destination);
  }
  
  source.start();
  
  const renderedBuffer = await offlineContext.startRendering();
  
  // 將處理後的音頻轉換為 Blob
  const mediaStreamDestination = audioContext.createMediaStreamDestination();
  const source2 = audioContext.createBufferSource();
  source2.buffer = renderedBuffer;
  source2.connect(mediaStreamDestination);
  
  const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
  
  return new Promise((resolve, reject) => {
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: file.type });
      resolve(blob);
    };
    
    mediaRecorder.onerror = (e) => {
      reject(new Error('音頻處理失敗'));
    };
    
    mediaRecorder.start();
    source2.start();
    
    setTimeout(() => {
      mediaRecorder.stop();
    }, renderedBuffer.duration * 1000 + 100);
  });
} 