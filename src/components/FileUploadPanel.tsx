import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

interface FileUploadPanelProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

const FileUploadPanel: React.FC<FileUploadPanelProps> = ({
  onFileUpload,
  acceptedFileTypes = ['image/*', 'audio/*', 'text/*'],
  maxFileSize = 10 * 1024 * 1024 // 10MB
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > maxFileSize) {
        setError(`檔案大小不能超過 ${maxFileSize / 1024 / 1024}MB`);
        return;
      }
      onFileUpload(file);
    }
  }, [maxFileSize, onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    multiple: false
  });

  return (
    <motion.div
      className="w-full p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200 ease-in-out
          flex flex-col items-center justify-center
          min-h-[200px] cursor-pointer
          ${isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
        `}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={() => setIsDragging(false)}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={{ scale: isDragging ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          <svg
            className={`
              w-12 h-12 mx-auto mb-4
              ${isDragActive
                ? 'text-blue-500'
                : 'text-gray-400 dark:text-gray-500'
              }
            `}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
            {isDragActive
              ? '放開以上傳檔案'
              : '將檔案拖放到此處，或點擊選擇檔案'
            }
          </p>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            支援的檔案類型：{acceptedFileTypes.join(', ')}
          </p>
          
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FileUploadPanel; 