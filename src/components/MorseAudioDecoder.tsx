import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiPlay, FiPause } from 'react-icons/fi';
import MorseDecoder from '../utils/morse';

interface MorseAudioDecoderProps {
  onResult?: (result: { morseCode: string; decodedText: string }) => void;
}

const MorseAudioDecoder: React.FC<MorseAudioDecoderProps> = ({ onResult }) => {
  const [isDecoding, setIsDecoding] = useState(false);
  const [morseCode, setMorseCode] = useState<string>('');
  const [decodedText, setDecodedText] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio/wav')) {
      setError('請上傳 WAV 格式的音頻檔案');
      return;
    }

    try {
      setIsDecoding(true);
      setError('');

      const buffer = await file.arrayBuffer();
      const result = await MorseDecoder.decodeFromAudio(buffer);

      setMorseCode(result.morseCode);
      setDecodedText(result.decodedText);
      onResult?.(result);

      // 創建音頻 URL 供播放
      const audioBlob = new Blob([buffer], { type: 'audio/wav' });
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(audioBlob);
      }
    } catch (err) {
      setError('解碼失敗：' + (err instanceof Error ? err.message : '未知錯誤'));
    } finally {
      setIsDecoding(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
          摩斯密碼音頻解碼
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* 檔案上傳區域 */}
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/wav"
            onChange={handleFileUpload}
            className="hidden"
          />
          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            點擊或拖放 WAV 檔案至此處
          </p>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* 解碼結果 */}
        {morseCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* 音頻播放控制 */}
            <div className="flex items-center space-x-4">
              <audio ref={audioRef} onEnded={handleAudioEnded} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlay}
                className="p-3 rounded-full bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors"
              >
                {isPlaying ? (
                  <FiPause className="w-6 h-6" />
                ) : (
                  <FiPlay className="w-6 h-6" />
                )}
              </motion.button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isPlaying ? '正在播放' : '點擊播放'}
              </span>
            </div>

            {/* 解碼結果顯示 */}
            <div className="space-y-2">
              <div className="font-mono text-sm p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
                <div className="text-gray-500 dark:text-gray-400 mb-1">解密結果：</div>
                <div className="text-gray-800 dark:text-dark-text">{decodedText}</div>
              </div>
              <div className="font-mono text-sm p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
                <div className="text-gray-500 dark:text-gray-400 mb-1">摩斯密碼：</div>
                <div className="text-gray-800 dark:text-dark-text break-all">{morseCode}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 載入中狀態 */}
        {isDecoding && (
          <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">解碼中...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MorseAudioDecoder; 