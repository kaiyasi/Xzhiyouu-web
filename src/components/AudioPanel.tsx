import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import FileUploadPanel from './FileUploadPanel';
import { DecoderOptions } from '../types';

interface AudioPanelProps {
  onDecode: (file: File, options: DecoderOptions) => Promise<void>;
  onAnalyze: (audioBuffer: AudioBuffer) => Promise<void>;
}

const AudioPanel: React.FC<AudioPanelProps> = ({ onDecode, onAnalyze }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visualizationData, setVisualizationData] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleFileUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      
      // 創建音頻 URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      // 解碼音頻
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // 分析音頻
      await onAnalyze(audioBuffer);
      
      // 設置音頻可視化
      setupAudioVisualization(audioContext, audioBuffer);
      
      // 解碼文件
      await onDecode(file, {
        format: file.type,
        variant: 'audio'
      });
    } catch (error) {
      console.error('音頻處理失敗:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const setupAudioVisualization = (context: AudioContext, buffer: AudioBuffer) => {
    if (!canvasRef.current) return;
    
    const analyzer = context.createAnalyser();
    analyzer.fftSize = 2048;
    
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(analyzer);
    analyzer.connect(context.destination);
    
    audioContextRef.current = context;
    analyzerRef.current = analyzer;
    
    // 繪製波形
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;
    
    const draw = () => {
      requestAnimationFrame(draw);
      
      const width = canvas.width;
      const height = canvas.height;
      
      analyzer.getByteTimeDomainData(dataArray);
      
      canvasCtx.fillStyle = 'rgb(20, 20, 20)';
      canvasCtx.fillRect(0, 0, width, height);
      
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 255, 0)';
      canvasCtx.beginPath();
      
      const sliceWidth = width * 1.0 / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height / 2;
        
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };
    
    draw();
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          音頻分析工具
        </h2>

        <div className="space-y-6">
          {/* 文件上傳 */}
          <FileUploadPanel
            onFileUpload={handleFileUpload}
            acceptedFileTypes={['audio/*']}
          />

          {/* 音頻播放器 */}
          {audioUrl && (
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="hidden"
              />

              {/* 波形顯示 */}
              <canvas
                ref={canvasRef}
                className="w-full h-32 bg-gray-900 rounded-lg"
                width={800}
                height={128}
              />

              {/* 控制按鈕 */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePlayPause}
                  className="flex items-center justify-center w-10 h-10 rounded-full
                           bg-blue-500 hover:bg-blue-600 text-white focus:outline-none"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 mx-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    value={currentTime}
                    onChange={(e) => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Number(e.target.value);
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 處理中提示 */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400"
            >
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>正在分析音頻...</span>
            </motion.div>
          )}
        </div>

        {/* 使用說明 */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            功能說明
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• 支援 WAV、MP3、OGG 等常見音頻格式</li>
            <li>• 即時波形顯示和頻譜分析</li>
            <li>• 自動檢測音頻中的隱藏信息</li>
            <li>• 支援摩斯密碼和音頻隱寫術解碼</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioPanel; 