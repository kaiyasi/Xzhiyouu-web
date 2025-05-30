import React from 'react';
import { DecodeMethod } from '../types';

interface SettingsPanelProps {
  method: DecodeMethod;
  options: any;
  onOptionsChange: (options: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  method,
  options,
  onOptionsChange
}) => {
  const renderSettings = () => {
    switch (method) {
      case 'caesar':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              位移量
            </label>
            <input
              type="number"
              value={options.shift || 3}
              onChange={(e) => onOptionsChange({ ...options, shift: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              min="1"
              max="25"
            />
          </div>
        );

      case 'vigenere':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              關鍵字
            </label>
            <input
              type="text"
              value={options.keyword || ''}
              onChange={(e) => onOptionsChange({ ...options, keyword: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="請輸入關鍵字"
            />
          </div>
        );

      case 'playfair':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              密鑰
            </label>
            <input
              type="text"
              value={options.playfairKey || ''}
              onChange={(e) => onOptionsChange({ ...options, playfairKey: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="請輸入密鑰"
            />
          </div>
        );

      case 'railfence':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              柵欄數
            </label>
            <input
              type="number"
              value={options.rails || 3}
              onChange={(e) => onOptionsChange({ ...options, rails: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              min="2"
              max="10"
            />
          </div>
        );

      case 'affine':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                參數 a
              </label>
              <input
                type="number"
                value={options.a || 1}
                onChange={(e) => onOptionsChange({ ...options, a: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                min="1"
                max="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                參數 b
              </label>
              <input
                type="number"
                value={options.b || 0}
                onChange={(e) => onOptionsChange({ ...options, b: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                min="0"
                max="25"
              />
            </div>
          </div>
        );

      case 'substitution':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              替換表
            </label>
            <textarea
              value={JSON.stringify(options.substitutionMap || {}, null, 2)}
              onChange={(e) => {
                try {
                  const map = JSON.parse(e.target.value);
                  onOptionsChange({ ...options, substitutionMap: map });
                } catch (error) {
                  // 忽略無效的 JSON
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              rows={5}
              placeholder="請輸入 JSON 格式的替換表"
            />
          </div>
        );

      case 'jwt':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                密鑰
              </label>
              <input
                type="text"
                value={options.secret || ''}
                onChange={(e) => onOptionsChange({ ...options, secret: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="請輸入 JWT 密鑰"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                算法
              </label>
              <select
                value={options.algorithm || 'HS256'}
                onChange={(e) => onOptionsChange({ ...options, algorithm: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="HS256">HS256</option>
                <option value="HS384">HS384</option>
                <option value="HS512">HS512</option>
              </select>
            </div>
          </div>
        );

      case 'whitespace':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              空白字符
            </label>
            <select
              value={options.type || 'space-tab'}
              onChange={(e) => onOptionsChange({ ...options, type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="space-tab">空格和製表符</option>
              <option value="space">僅空格</option>
              <option value="tab">僅製表符</option>
            </select>
          </div>
        );

      case 'zero-width':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              零寬字符
            </label>
            <select
              value={options.type || 'zwsp-zwnj'}
              onChange={(e) => onOptionsChange({ ...options, type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="zwsp-zwnj">ZWSP 和 ZWNJ</option>
              <option value="zwsp">僅 ZWSP</option>
              <option value="zwnj">僅 ZWNJ</option>
            </select>
          </div>
        );

      case 'base32':
      case 'base58':
      case 'base85':
      case 'base91':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              填充
            </label>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={options.padding}
                  onChange={(e) => onOptionsChange({ ...options, padding: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  使用填充字符
                </span>
              </label>
            </div>
          </div>
        );

      case 'brainfuck':
      case 'ook':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              記憶體大小
            </label>
            <input
              type="number"
              value={options.memorySize || 30000}
              onChange={(e) => onOptionsChange({ ...options, memorySize: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              min="1000"
              max="100000"
              step="1000"
            />
          </div>
        );

      case 'uuencode':
      case 'xxencode':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              文件名
            </label>
            <input
              type="text"
              value={options.filename || ''}
              onChange={(e) => onOptionsChange({ ...options, filename: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="請輸入文件名"
            />
          </div>
        );

      case 'hex-color':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              顏色格式
            </label>
            <select
              value={options.format || 'hex'}
              onChange={(e) => onOptionsChange({ ...options, format: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="hex">十六進制 (#RRGGBB)</option>
              <option value="rgb">RGB (rgb(r,g,b))</option>
              <option value="hsl">HSL (hsl(h,s%,l%))</option>
            </select>
          </div>
        );

      case 'dna':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              編碼方式
            </label>
            <select
              value={options.encoding || '1'}
              onChange={(e) => onOptionsChange({ ...options, encoding: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="1">編碼 1 (A=00,C=01,G=10,T=11)</option>
              <option value="2">編碼 2 (A=01,C=10,G=11,T=00)</option>
              <option value="3">編碼 3 (A=11,C=00,G=01,T=10)</option>
            </select>
          </div>
        );

      case 'tap':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              輸出格式
            </label>
            <select
              value={options.format || 'dots'}
              onChange={(e) => onOptionsChange({ ...options, format: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="dots">點號 (.)</option>
              <option value="numbers">數字 (1-5)</option>
            </select>
          </div>
        );

      case 'phonetic':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                分隔符
              </label>
              <input
                type="text"
                value={options.separator || ' '}
                onChange={(e) => onOptionsChange({ ...options, separator: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                maxLength={1}
                placeholder="輸入分隔符"
              />
            </div>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={options.upperCase}
                  onChange={(e) => onOptionsChange({ ...options, upperCase: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  使用大寫
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        設定
      </h3>
      {renderSettings()}
    </div>
  );
};

export default SettingsPanel; 