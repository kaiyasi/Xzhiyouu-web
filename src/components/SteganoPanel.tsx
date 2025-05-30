import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FileUploadPanel from './FileUploadPanel';
import { DecoderOptions } from '../types';

interface SteganoPanelProps {
  onDecode: (file: File, options: DecoderOptions) => Promise<void>;
}

const SteganoPanel: React.FC<SteganoPanelProps> = ({ onDecode }) => {
  const [method, setMethod] = useState<'lsb' | 'metadata' | 'eog'>('lsb');
  const [bitsPerChannel, setBitsPerChannel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      await onDecode(file, {
        steganoMethod: method,
        bitsPerChannel
      });
    } catch (error) {
      console.error('隱寫術解碼失敗:', error);
    } finally {
      setIsProcessing(false);
    }
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
          隱寫術工具
        </h2>

        <div className="space-y-6">
          {/* 方法選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              解碼方法
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as 'lsb' | 'metadata' | 'eog')}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lsb">最低有效位 (LSB)</option>
              <option value="metadata">元數據</option>
              <option value="eog">文件結尾</option>
            </select>
          </div>

          {/* LSB 設置 */}
          {method === 'lsb' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                每通道位元數
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={bitsPerChannel}
                onChange={(e) => setBitsPerChannel(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* 文件上傳 */}
          <div>
            <FileUploadPanel
              onFileUpload={handleFileUpload}
              acceptedFileTypes={['image/*', 'audio/*']}
            />
          </div>

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
              <span>正在處理...</span>
            </motion.div>
          )}
        </div>

        {/* 使用說明 */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            使用說明
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• LSB：分析圖片或音頻的最低有效位中隱藏的信息</li>
            <li>• 元數據：檢查文件的元數據中是否包含隱藏信息</li>
            <li>• 文件結尾：檢查文件結尾是否附加了額外數據</li>
            <li>• 支援的文件類型：PNG、JPG、WAV、MP3 等</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default SteganoPanel; 