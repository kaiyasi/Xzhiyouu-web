import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DecodeResult } from '../types';

interface HistoryPanelProps {
  history: DecodeResult[];
  onClear: () => void;
  onRestore: (result: DecodeResult) => void;
  onDelete: (index: number) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onClear,
  onRestore,
  onDelete
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            解密歷史
          </h2>
          
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700
                     dark:text-red-400 dark:hover:text-red-300"
          >
            清除全部
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {history.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                暫無解密記錄
              </motion.div>
            ) : (
              history.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${result.status === 'success'
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }
                      `}>
                        {result.status === 'success' ? '成功' : '失敗'}
                      </span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {result.method}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onRestore(result)}
                        className="text-blue-600 hover:text-blue-700
                                 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(index)}
                        className="text-red-600 hover:text-red-700
                                 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <pre className="text-sm bg-gray-100 dark:bg-gray-600 rounded p-2 overflow-x-auto">
                      {result.result}
                    </pre>
                  </div>

                  {result.additionalInfo && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">附加信息：</span>
                      {result.additionalInfo.type && (
                        <span className="ml-1">類型: {result.additionalInfo.type}</span>
                      )}
                      {result.additionalInfo.preview && (
                        <span className="ml-2">預覽: {result.additionalInfo.preview}</span>
                      )}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(new Date())}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {history.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            共 {history.length} 條記錄
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HistoryPanel; 