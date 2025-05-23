import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck, FiLock, FiUnlock, FiSettings, FiCode, FiImage, FiHash, FiType } from 'react-icons/fi';
import { DecodeMethod, OperationType } from '../types';

interface MethodOption {
  value: DecodeMethod;
  label: string;
  description?: string;
}

interface CategoryOption {
  category: string;
  methods: MethodOption[];
  icon?: React.ReactNode;
  description?: string;
}

interface DecodePanelProps {
  selectedMethods: DecodeMethod[];
  onMethodsChange: (methods: DecodeMethod[]) => void;
  onDecode: () => void;
  onClear: () => void;
  isDecoding: boolean;
  operationType: OperationType;
  onOperationTypeChange: (type: OperationType) => void;
}

const decodeOptions: CategoryOption[] = [
  {
    category: '基礎編碼',
    icon: <FiCode className="w-5 h-5" />,
    description: '常見的編碼轉換',
    methods: [
      { value: 'base64', label: 'Base64', description: '基於 64 個可打印字符的編碼方式' },
      { value: 'base32', label: 'Base32', description: '使用 32 個字符的編碼' },
      { value: 'base58', label: 'Base58', description: '比特幣地址使用的編碼' },
      { value: 'base85', label: 'Base85', description: 'Ascii85 編碼' },
      { value: 'hex', label: 'Hexadecimal', description: '十六進制編碼' },
      { value: 'binary', label: 'Binary', description: '二進制編碼' },
      { value: 'ascii', label: 'ASCII', description: 'ASCII 字符編碼' },
      { value: 'decimal', label: 'Decimal', description: '十進制編碼' },
      { value: 'url', label: 'URL', description: 'URL 編碼/解碼' },
      { value: 'unicode', label: 'Unicode', description: 'Unicode 編碼轉換' },
      { value: 'utf8', label: 'UTF-8', description: 'UTF-8 編碼轉換' },
    ],
  },
  {
    category: '替換密碼',
    icon: <FiLock className="w-5 h-5" />,
    description: '字符替換類型的加密',
    methods: [
      { value: 'caesar', label: 'Caesar', description: '凱薩密碼（位移密碼）' },
      { value: 'rot13', label: 'ROT13', description: 'ROT13 編碼' },
      { value: 'atbash', label: 'Atbash', description: '字母表反轉密碼' },
      { value: 'vigenere', label: 'Vigenère', description: '維吉尼亞密碼' },
      { value: 'substitution', label: 'Substitution', description: '單表替換密碼' },
      { value: 'affine', label: 'Affine', description: '仿射密碼' },
      { value: 'pigpen', label: 'Pigpen', description: '豬圈密碼' },
      { value: 'railfence', label: 'Rail Fence', description: '柵欄密碼' },
      { value: 'playfair', label: 'Playfair', description: 'Playfair 密碼' },
    ],
  },
  {
    category: '古典密碼',
    icon: <FiUnlock className="w-5 h-5" />,
    description: '歷史上使用的經典密碼',
    methods: [
      { value: 'morse', label: 'Morse', description: '摩斯密碼' },
      { value: 'bacon', label: 'Bacon', description: '培根密碼' },
      { value: 'polybius', label: 'Polybius', description: '波利比奧斯方陣' },
      { value: 'tap', label: 'Tap Code', description: '敲擊碼' },
    ],
  },
  {
    category: '現代密碼',
    icon: <FiHash className="w-5 h-5" />,
    description: '現代加密和雜湊算法',
    methods: [
      { value: 'md5', label: 'MD5', description: 'MD5 雜湊' },
      { value: 'sha1', label: 'SHA1', description: 'SHA1 雜湊' },
      { value: 'sha256', label: 'SHA256', description: 'SHA256 雜湊' },
      { value: 'sha512', label: 'SHA512', description: 'SHA512 雜湊' },
      { value: 'jwt', label: 'JWT', description: 'JSON Web Token 解碼' },
    ],
  },
  {
    category: '特殊編碼',
    icon: <FiType className="w-5 h-5" />,
    description: '特殊的編碼方式',
    methods: [
      { value: 'brainfuck', label: 'Brainfuck', description: 'Brainfuck 編程語言' },
      { value: 'jsfuck', label: 'JSFuck', description: 'JavaScript 混淆' },
      { value: 'aaencode', label: 'AAEncode', description: '顏文字編碼' },
      { value: 'jother', label: 'Jother', description: 'JavaScript 混淆變體' },
      { value: 'ook', label: 'Ook!', description: 'Ook! 編程語言' },
      { value: 'uuencode', label: 'UUEncode', description: 'Unix-to-Unix 編碼' },
      { value: 'xxencode', label: 'XXEncode', description: 'UUEncode 變體' },
      { value: 'base91', label: 'Base91', description: 'basE91 編碼' },
    ],
  },
  {
    category: '隱寫術',
    icon: <FiImage className="w-5 h-5" />,
    description: '隱藏信息的技術',
    methods: [
      { value: 'whitespace', label: 'Whitespace', description: '空白字符隱寫' },
      { value: 'zero-width', label: 'Zero-width', description: '零寬字符隱寫' },
      { value: 'stegano', label: 'Steganography', description: '圖片隱寫' },
      { value: 'audio-steg', label: 'Audio Steg', description: '音頻隱寫' },
    ],
  },
  {
    category: '其他',
    icon: <FiSettings className="w-5 h-5" />,
    description: '其他編碼和密碼',
    methods: [
      { value: 'reverse', label: 'Reverse', description: '字符串反轉' },
      { value: 'qwerty', label: 'QWERTY', description: 'QWERTY 鍵盤密碼' },
      { value: 'keyboard', label: 'Keyboard', description: '鍵盤布局密碼' },
      { value: 'phonetic', label: 'Phonetic', description: '音標密碼' },
      { value: 'dna', label: 'DNA', description: 'DNA 序列密碼' },
      { value: 'hex-color', label: 'Hex Color', description: '顏色代碼轉換' },
    ],
  },
];

function DecodePanel({
  selectedMethods,
  onMethodsChange,
  onDecode,
  onClear,
  isDecoding,
  operationType,
  onOperationTypeChange,
}: DecodePanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [caesarRange, setCaesarRange] = useState<[number, number]>([1, 25]);
  const [hoveredMethod, setHoveredMethod] = useState<DecodeMethod | null>(null);

  const toggleMethod = (method: DecodeMethod) => {
    if (selectedMethods.includes(method)) {
      onMethodsChange(selectedMethods.filter((m) => m !== method));
    } else {
      onMethodsChange([...selectedMethods, method]);
    }
  };

  const toggleAllMethods = () => {
    if (selectedMethods.length === decodeOptions.flatMap((opt) => opt.methods).length) {
      onMethodsChange([]);
    } else {
      onMethodsChange(decodeOptions.flatMap((opt) => opt.methods.map((m) => m.value)));
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">解密選項</h2>
          <button
            onClick={toggleAllMethods}
            className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors dark:text-primary-400 dark:hover:text-primary-300"
          >
            {selectedMethods.length === decodeOptions.flatMap((opt) => opt.methods).length
              ? '取消全選'
              : '全選'}
          </button>
        </div>

        <div className="flex items-center justify-center p-1 bg-gray-100 dark:bg-dark-hover rounded-lg">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOperationTypeChange('encode')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              operationType === 'encode'
                ? 'bg-white dark:bg-dark-card text-primary-500 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            加密
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOperationTypeChange('decode')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              operationType === 'decode'
                ? 'bg-white dark:bg-dark-card text-primary-500 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            解密
          </motion.button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {decodeOptions.map((category) => (
          <motion.div
            key={category.category}
            className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden"
            initial={false}
          >
            <motion.button
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-dark-hover hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
              onClick={() => setExpandedCategory(
                expandedCategory === category.category ? null : category.category
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="text-gray-500 dark:text-gray-400">
                  {category.icon}
                </div>
                <span className="font-medium text-gray-700 dark:text-dark-text">
                  {category.category}
                </span>
                <div className="flex items-center space-x-1">
                  {category.methods.some(m => selectedMethods.includes(m.value)) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400"
                    />
                  )}
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedCategory === category.category ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </motion.div>
            </motion.button>

            <AnimatePresence initial={false}>
              {expandedCategory === category.category && (
                <motion.div
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  variants={{
                    expanded: { height: "auto", opacity: 1 },
                    collapsed: { height: 0, opacity: 0 }
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {category.methods.map((method) => (
                      <motion.div
                        key={method.value}
                        initial={false}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onHoverStart={() => setHoveredMethod(method.value)}
                        onHoverEnd={() => setHoveredMethod(null)}
                      >
                        <label className="relative flex items-center p-3 rounded-lg cursor-pointer border-2 transition-all hover:shadow-md dark:hover:shadow-none">
                          <input
                            type="checkbox"
                            className="absolute opacity-0"
                            checked={selectedMethods.includes(method.value)}
                            onChange={() => toggleMethod(method.value)}
                          />
                          <div
                            className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${
                              selectedMethods.includes(method.value)
                                ? 'bg-primary-500 border-primary-500 dark:bg-primary-600 dark:border-primary-600'
                                : hoveredMethod === method.value
                                ? 'border-primary-500 dark:border-primary-400'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <AnimatePresence>
                              {selectedMethods.includes(method.value) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <FiCheck className="w-3 h-3 text-white" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
                            {method.label}
                          </span>
                        </label>
                      </motion.div>
                    ))}
                  </div>

                  {category.category === '替換密碼' && (
                    <div className="px-4 pb-4">
                      <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                          Caesar 密碼範圍
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="number"
                            min="1"
                            max="25"
                            value={caesarRange[0]}
                            onChange={(e) => setCaesarRange([parseInt(e.target.value), caesarRange[1]])}
                            className="w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-md dark:bg-dark-card dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                          />
                          <span className="text-gray-500 dark:text-gray-400">到</span>
                          <input
                            type="number"
                            min="1"
                            max="25"
                            value={caesarRange[1]}
                            onChange={(e) => setCaesarRange([caesarRange[0], parseInt(e.target.value)])}
                            className="w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-md dark:bg-dark-card dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="p-4 flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDecode}
          disabled={isDecoding}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all ${
            isDecoding
              ? 'bg-primary-400 dark:bg-primary-600 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 hover:shadow-lg dark:hover:shadow-primary-500/25'
          }`}
        >
          {isDecoding ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
              處理中...
            </div>
          ) : (
            operationType === 'encode' ? '加密' : '解密'
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClear}
          className="flex-1 py-3 px-4 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all hover:shadow-lg dark:hover:shadow-red-500/25"
        >
          清除
        </motion.button>
      </div>
    </div>
  );
}

export default DecodePanel; 