import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX, FiFile, FiMusic, FiCopy, FiTrash2 } from 'react-icons/fi';

interface InputPanelProps {
  input: string;
  onInputChange: (value: string) => void;
  onWavFile?: (audioBuffer: AudioBuffer) => void;
}

function InputPanel({ input, onInputChange, onWavFile }: InputPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [fileName, setFileName] = useState<string | null>(null);

  const processWavFile = async (file: File) => {
    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      onWavFile?.(audioBuffer);
      setFileName(file.name);
      return true;
    } catch (err) {
      console.error('Error processing WAV file:', err);
      return false;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setIsProcessing(true);

    try {
      const file = acceptedFiles[0];
      if (file.type === 'audio/wav') {
        const success = await processWavFile(file);
        if (!success) {
          setError('無法處理該 WAV 檔案，請確保檔案格式正確');
        }
      } else {
        const text = await file.text();
        onInputChange(text);
        setFileName(file.name);
      }
    } catch (err) {
      console.error('Error reading file:', err);
      setError('讀取檔案時發生錯誤，請重試');
    } finally {
      setIsProcessing(false);
    }
  }, [onInputChange, onWavFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md', '.json', '.xml', '.csv'],
      'audio/wav': ['.wav']
    },
    multiple: false
  });

  const handleClear = () => {
    onInputChange('');
    setError(null);
    setFileName(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input);
      // 可以添加複製成功的提示
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">輸入區域</h2>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              disabled={!input}
              className={`p-2 rounded-full transition-colors ${
                input
                  ? 'text-primary-500 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title="複製內容"
            >
              <FiCopy className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              disabled={!input && !fileName}
              className={`p-2 rounded-full transition-colors ${
                input || fileName
                  ? 'text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title="清除內容"
            >
              <FiTrash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'text'
                ? 'bg-primary-500 text-white dark:bg-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-hover dark:text-dark-text dark:hover:bg-dark-card'
            }`}
          >
            文字輸入
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'file'
                ? 'bg-primary-500 text-white dark:bg-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-hover dark:text-dark-text dark:hover:bg-dark-card'
            }`}
          >
            檔案上傳
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'text' ? (
          <motion.div
            key="text-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            <textarea
              value={input}
              onChange={(e) => {
                onInputChange(e.target.value);
                setError(null);
              }}
              placeholder="在此輸入要處理的文字..."
              className={`w-full h-[200px] p-4 bg-transparent resize-y rounded-lg border-2 focus:outline-none transition-colors ${
                error
                  ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400'
                  : 'border-gray-200 focus:border-primary-500 dark:border-gray-700 dark:focus:border-primary-400'
              } dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500`}
              disabled={isProcessing}
            />
          </motion.div>
        ) : (
          <motion.div
            key="file-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            <div
              {...getRootProps()}
              className={`relative min-h-[200px] rounded-lg border-2 border-dashed transition-all ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                  : error
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <input {...getInputProps()} />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <motion.div
                  initial={false}
                  animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4"
                >
                  {fileName ? (
                    <div className="flex items-center space-x-2 text-primary-500 dark:text-primary-400">
                      {fileName.endsWith('.wav') ? (
                        <FiMusic className="w-8 h-8" />
                      ) : (
                        <FiFile className="w-8 h-8" />
                      )}
                      <span className="text-sm font-medium">{fileName}</span>
                    </div>
                  ) : isDragActive ? (
                    <FiUpload className="w-12 h-12 text-primary-500 dark:text-primary-400" />
                  ) : (
                    <div className="p-4 rounded-full bg-primary-50 dark:bg-primary-900/20">
                      <FiUpload className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                    </div>
                  )}
                </motion.div>
                
                <div className="text-center">
                  {fileName ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                      className="text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    >
                      移除檔案
                    </motion.button>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                        {isDragActive ? '放開以上傳檔案' : '拖放檔案至此，或點擊上傳'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        支援 TXT、MD、JSON、XML、CSV 及 WAV 檔案
                      </p>
                    </>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-4 left-4 right-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm rounded"
                  >
                    <div className="flex items-center">
                      <FiX className="w-4 h-4 mr-2 flex-shrink-0" />
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-black/20 backdrop-blur-sm">
          <div className="flex items-center space-x-3 bg-white dark:bg-dark-card px-6 py-3 rounded-full shadow-lg">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">處理中...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default InputPanel; 