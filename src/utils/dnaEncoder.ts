import { validateInput, EncoderError, EncoderErrorType } from './errors';

// DNA 編碼映射表
const DNA_ENCODINGS = {
  '1': {
    '00': 'A', '01': 'C', '10': 'G', '11': 'T',
    'A': '00', 'C': '01', 'G': '10', 'T': '11'
  },
  '2': {
    '01': 'A', '10': 'C', '11': 'G', '00': 'T',
    'A': '01', 'C': '10', 'G': '11', 'T': '00'
  },
  '3': {
    '11': 'A', '00': 'C', '01': 'G', '10': 'T',
    'A': '11', 'C': '00', 'G': '01', 'T': '10'
  }
};

/**
 * 將字符串轉換為二進制
 * @param input 輸入字符串
 * @returns 二進制字符串
 */
function stringToBinary(input: string): string {
  return input
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

/**
 * 將二進制轉換為字符串
 * @param binary 二進制字符串
 * @returns 字符串
 */
function binaryToString(binary: string): string {
  const bytes = binary.match(/.{8}/g) || [];
  return bytes
    .map(byte => String.fromCharCode(parseInt(byte, 2)))
    .join('');
}

/**
 * DNA 編碼
 * @param input 輸入字符串
 * @param encoding 編碼方式 (1-3)
 * @returns DNA 序列
 */
export function encodeDNA(input: string, encoding: '1' | '2' | '3' = '1'): string {
  input = validateInput(input);
  const binary = stringToBinary(input);
  const dnaMap = DNA_ENCODINGS[encoding];
  
  let result = '';
  for (let i = 0; i < binary.length; i += 2) {
    const bits = binary.slice(i, i + 2);
    if (bits.length < 2) {
      throw new EncoderError(
        EncoderErrorType.INVALID_INPUT,
        '輸入長度必須是偶數位元'
      );
    }
    const base = dnaMap[bits];
    if (!base) {
      throw new EncoderError(
        EncoderErrorType.INVALID_INPUT,
        `無效的二進制序列: ${bits}`
      );
    }
    result += base;
  }
  
  return result;
}

/**
 * DNA 解碼
 * @param input DNA 序列
 * @param encoding 編碼方式 (1-3)
 * @returns 解碼後的字符串
 */
export function decodeDNA(input: string, encoding: '1' | '2' | '3' = '1'): string {
  input = validateInput(input);
  const dnaMap = DNA_ENCODINGS[encoding];
  
  let binary = '';
  for (const base of input.toUpperCase()) {
    const bits = dnaMap[base];
    if (!bits) {
      throw new EncoderError(
        EncoderErrorType.INVALID_CHARACTER,
        `無效的 DNA 鹼基: ${base}`
      );
    }
    binary += bits;
  }
  
  if (binary.length % 8 !== 0) {
    throw new EncoderError(
      EncoderErrorType.INVALID_INPUT,
      'DNA 序列長度無效'
    );
  }
  
  return binaryToString(binary);
} 