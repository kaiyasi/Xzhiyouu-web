import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DecoderOptions } from '../types';

interface HashPanelProps {
  onDecode: (input: string, options: DecoderOptions) => Promise<void>;
  onCrack: (hash: string, algorithm: string) => Promise<void>;
}

const HashPanel: React.FC<HashPanelProps> = ({ onDecode, onCrack }) => {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<string>('md5');
  const [mode, setMode] = useState<'decode' | 'crack'>('decode');
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<DecoderOptions>({
    hashFormat: 'hex',
    iterations: 1000
  });

  const algorithms = [
    { value: 'md5', label: 'MD5' },
    { value: 'sha1', label: 'SHA-1' },
    { value: 'sha256', label: 'SHA-256' },
    { value: 'sha512', label: 'SHA-512' },
    { value: 'bcrypt', label: 'bcrypt' },
    { value: 'pbkdf2', label: 'PBKDF2' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      if (mode === 'decode') {
        await onDecode(input, {
          ...options,
          variant: algorithm
        });
      } else {
        await onCrack(input, algorithm);
      }
    } catch (error) {
      console.error('處理失敗:', error);
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
          雜湊處理工具
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 模式選擇 */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setMode('decode')}
              className={`
                flex-1 py-2 px-4 rounded-lg font-medium
                ${mode === 'decode'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }
              `}
            >
              解碼模式
            </button>
            <button
              type="button"
              onClick={() => setMode('crack')}
              className={`
                flex-1 py-2 px-4 rounded-lg font-medium
                ${mode === 'crack'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }
              `}
            >
              破解模式
            </button>
          </div>

          {/* 算法選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              雜湊算法
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {algorithms.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 輸入區域 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {mode === 'decode' ? '輸入雜湊值' : '要破解的雜湊值'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       resize-none"
              placeholder={mode === 'decode'
                ? '請輸入要解碼的雜湊值...'
                : '請輸入要破解的雜湊值...'
              }
            />
          </div>

          {/* 高級選項 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              高級選項
            </h3>

            {/* 輸出格式 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                輸出格式
              </label>
              <select
                value={options.hashFormat}
                onChange={(e) => setOptions({ ...options, hashFormat: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hex">十六進制</option>
                <option value="base64">Base64</option>
              </select>
            </div>

            {/* PBKDF2 迭代次數 */}
            {algorithm === 'pbkdf2' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  迭代次數
                </label>
                <input
                  type="number"
                  min="1"
                  value={options.iterations}
                  onChange={(e) => setOptions({ ...options, iterations: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Salt 值 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salt 值（可選）
              </label>
              <input
                type="text"
                value={options.salt || ''}
                onChange={(e) => setOptions({ ...options, salt: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="請輸入 salt 值..."
              />
            </div>
          </div>

          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className={`
              w-full py-3 px-4 rounded-lg font-medium text-white
              ${isProcessing || !input.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }
            `}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
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
                <span>處理中...</span>
              </div>
            ) : (
              mode === 'decode' ? '解碼' : '開始破解'
            )}
          </button>
        </form>

        {/* 使用說明 */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            功能說明
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• 支援多種常見雜湊算法</li>
            <li>• 提供雜湊值解碼和破解功能</li>
            <li>• 可自定義 salt 值和迭代次數</li>
            <li>• 支援多種輸出格式</li>
            {mode === 'crack' && (
              <li className="text-yellow-600 dark:text-yellow-400">
                ⚠️ 破解模式可能需要較長時間，請耐心等待
              </li>
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default HashPanel; 