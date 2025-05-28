import React, { useState } from 'react';
import { DecodeMethod } from '../types';
import { motion } from 'framer-motion';
import { KeyManager } from '../utils/keyManager';

interface KeyInputPanelProps {
  selectedMethods: DecodeMethod[];
  onKeyChange: (method: DecodeMethod, key: string) => void;
}

interface KeyConfig {
  method: DecodeMethod;
  label: string;
  placeholder?: string;
  type: 'text' | 'number' | 'range';
  min?: number;
  max?: number;
  step?: number;
  description: string;
  validate?: (value: string) => { isValid: boolean; error?: string };
}

const keyConfigs: KeyConfig[] = [
  {
    method: 'vigenere',
    label: '維吉尼亞密鑰',
    placeholder: '請輸入密鑰（僅限英文字母）',
    type: 'text',
    description: '用於維吉尼亞密碼解密的密鑰',
    validate: (value) => {
      if (!value) return { isValid: false, error: '請輸入密鑰' };
      if (!value.match(/^[A-Za-z]+$/)) return { isValid: false, error: '密鑰必須只包含英文字母' };
      return { isValid: true };
    }
  },
  {
    method: 'playfair',
    label: 'Playfair 密鑰',
    placeholder: '請輸入密鑰（僅限英文字母）',
    type: 'text',
    description: '用於 Playfair 密碼解密的密鑰',
    validate: (value) => {
      if (!value) return { isValid: false, error: '請輸入密鑰' };
      if (!value.match(/^[A-Za-z]+$/)) return { isValid: false, error: '密鑰必須只包含英文字母' };
      return { isValid: true };
    }
  },
  {
    method: 'railfence',
    label: '柵欄層數',
    placeholder: '請輸入柵欄層數（2-20）',
    type: 'number',
    min: 2,
    max: 20,
    description: '柵欄密碼的層數',
    validate: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) return { isValid: false, error: '請輸入有效數字' };
      if (num < 2 || num > 20) return { isValid: false, error: '層數必須在 2-20 之間' };
      return { isValid: true };
    }
  },
  {
    method: 'caesar',
    label: '凱薩位移',
    placeholder: '請輸入位移量（1-25）',
    type: 'number',
    min: 1,
    max: 25,
    description: '凱薩密碼的位移量',
    validate: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) return { isValid: false, error: '請輸入有效數字' };
      if (num < 1 || num > 25) return { isValid: false, error: '位移量必須在 1-25 之間' };
      return { isValid: true };
    }
  },
  {
    method: 'affine',
    label: '仿射參數',
    placeholder: '請輸入參數 a,b（例如：5,8）',
    type: 'text',
    description: '仿射密碼的參數（a 需要與 26 互質）',
    validate: (value) => {
      const [a, b] = value.split(',').map(n => parseInt(n.trim(), 10));
      if (isNaN(a) || isNaN(b)) return { isValid: false, error: '請輸入有效的數字對' };
      if (a < 1 || a > 25) return { isValid: false, error: '參數 a 必須在 1-25 之間' };
      if (b < 0 || b > 25) return { isValid: false, error: '參數 b 必須在 0-25 之間' };
      if (!KeyManager.isCoprime(a, 26)) return { isValid: false, error: '參數 a 必須與 26 互質' };
      return { isValid: true };
    }
  },
  {
    method: 'substitution',
    label: '替換表',
    placeholder: '請輸入替換表（例如：A=Z,B=Y,...）',
    type: 'text',
    description: '單表替換密碼的替換表',
    validate: (value) => {
      const pairs = value.split(',').map(pair => pair.trim().split('='));
      if (pairs.some(pair => pair.length !== 2)) return { isValid: false, error: '格式錯誤' };
      const map = Object.fromEntries(pairs);
      if (Object.keys(map).length !== 26) return { isValid: false, error: '必須包含所有 26 個字母' };
      if (!Object.entries(map).every(([k, v]) => 
        typeof k === 'string' && 
        typeof v === 'string' && 
        k.match(/^[A-Z]$/) && 
        v.match(/^[A-Z]$/)
      )) {
        return { isValid: false, error: '必須使用大寫英文字母' };
      }
      return { isValid: true };
    }
  }
];

const KeyInputPanel: React.FC<KeyInputPanelProps> = ({ selectedMethods, onKeyChange }) => {
  const [errors, setErrors] = useState<{ [key in DecodeMethod]?: string }>({});
  const [keys, setKeys] = useState<{ [key in DecodeMethod]?: string }>({});

  const handleKeyInput = (method: DecodeMethod, value: string) => {
    setKeys(prev => ({ ...prev, [method]: value }));
    
    const config = keyConfigs.find(c => c.method === method);
    if (config?.validate) {
      const validation = config.validate(value);
      setErrors(prev => ({ ...prev, [method]: validation.error }));
      if (validation.isValid) {
        onKeyChange(method, value);
      }
    } else {
      onKeyChange(method, value);
    }
  };

  const handleRandomKey = (method: DecodeMethod) => {
    const randomKey = KeyManager.generateRandomKey(method);
    let keyString = '';
    
    switch (method) {
      case 'vigenere':
      case 'playfair':
        keyString = randomKey.key || '';
        break;
      case 'railfence':
        keyString = String(randomKey.rails);
        break;
      case 'caesar':
        keyString = String(randomKey.shift);
        break;
      case 'affine':
        keyString = `${randomKey.a},${randomKey.b}`;
        break;
      case 'substitution':
        keyString = Object.entries(randomKey.substitutionMap || {})
          .map(([k, v]) => `${k}=${v}`)
          .join(',');
        break;
    }
    
    handleKeyInput(method, keyString);
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">密鑰設置</h2>
      {selectedMethods.map(method => {
        const config = keyConfigs.find(c => c.method === method);
        if (!config) return null;

        return (
          <motion.div
            key={method}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {config.label}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {config.description}
              </div>
            </label>
            <div className="flex space-x-2">
              <input
                type={config.type}
                min={config.min}
                max={config.max}
                step={config.step}
                placeholder={config.placeholder}
                value={keys[method] || ''}
                onChange={(e) => handleKeyInput(method, e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md text-sm
                  ${errors[method] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  dark:focus:ring-primary-400`}
              />
              <button
                onClick={() => handleRandomKey(method)}
                className="px-3 py-2 bg-primary-500 text-white rounded-md text-sm
                  hover:bg-primary-600 dark:hover:bg-primary-400
                  focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                  transition-colors duration-200"
              >
                隨機
              </button>
            </div>
            {errors[method] && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 dark:text-red-400"
              >
                {errors[method]}
              </motion.p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default KeyInputPanel; 