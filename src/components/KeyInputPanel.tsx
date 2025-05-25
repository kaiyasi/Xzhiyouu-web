import React from 'react';
import { DecodeMethod } from '../types';
import { motion } from 'framer-motion';

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
}

const keyConfigs: KeyConfig[] = [
  {
    method: 'vigenere',
    label: '維吉尼亞密鑰',
    placeholder: '請輸入密鑰（僅限英文字母）',
    type: 'text',
    description: '用於維吉尼亞密碼解密的密鑰'
  },
  {
    method: 'playfair',
    label: 'Playfair 密鑰',
    placeholder: '請輸入密鑰（僅限英文字母）',
    type: 'text',
    description: '用於 Playfair 密碼解密的密鑰'
  },
  {
    method: 'railfence',
    label: '柵欄層數',
    placeholder: '請輸入柵欄層數',
    type: 'number',
    min: 2,
    max: 20,
    description: '柵欄密碼的層數（2-20）'
  },
  {
    method: 'caesar',
    label: '凱薩位移',
    type: 'range',
    min: 1,
    max: 25,
    step: 1,
    description: '凱薩密碼的位移量（1-25）'
  },
  {
    method: 'affine',
    label: '仿射參數 a',
    type: 'number',
    min: 1,
    max: 25,
    description: '仿射密碼的參數 a（需要與 26 互質）'
  },
  {
    method: 'substitution',
    label: '替換表',
    placeholder: '請輸入 26 個字母的替換表',
    type: 'text',
    description: '單表替換密碼的替換表（26 個字母）'
  }
];

const KeyInputPanel: React.FC<KeyInputPanelProps> = ({ selectedMethods, onKeyChange }) => {
  const relevantConfigs = keyConfigs.filter(config => 
    selectedMethods.includes(config.method)
  );

  if (relevantConfigs.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-700">密鑰設定</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {relevantConfigs.map((config) => (
          <div key={config.method} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {config.label}
              <span className="ml-1 text-xs text-gray-500">
                ({config.description})
              </span>
            </label>
            {config.type === 'range' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  className="w-full"
                  onChange={(e) => onKeyChange(config.method, e.target.value)}
                />
                <span className="text-sm text-gray-600 w-8 text-center">
                  {config.min}-{config.max}
                </span>
              </div>
            ) : (
              <input
                type={config.type}
                placeholder={config.placeholder}
                min={config.min}
                max={config.max}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                onChange={(e) => onKeyChange(config.method, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default KeyInputPanel; 