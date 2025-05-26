import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MorseDecoder from '../utils/morse';

function Header() {
  const [isHintVisible, setIsHintVisible] = useState(false);

  const handleLogoClick = () => {
    const triggerSequence = '... --- ... -.-. - ..-.';
    const result = MorseDecoder.decodeMorseCode(triggerSequence);
    if (result.includes('NHISCCTF')) {
      alert('恭喜你發現了隱藏的 flag！\n' + result.split('\n').pop());
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-dark-card shadow-sm transition-colors"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick}>
            <img src="/logo.ico" alt="Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text">
              CTF Decode Tools
            </h1>
          </div>

          <motion.button
            className="text-gray-600 hover:text-primary-500 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsHintVisible(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {isHintVisible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsHintVisible(false)}
        >
          <motion.div
            className="bg-white rounded-lg p-6 max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">提示</h2>
            <p className="text-gray-600 mb-4">
              試試看用不同的解密方式組合？也許會有意想不到的發現喔！ (｡･ω･｡)
            </p>
            <div className="flex justify-end">
              <button
                className="text-primary-500 hover:text-primary-600 font-medium"
                onClick={() => setIsHintVisible(false)}
              >
                了解！
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.header>
  );
}

export default Header; 