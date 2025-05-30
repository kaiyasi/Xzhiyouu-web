import { validateInput, EncoderError, EncoderErrorType } from './errors';

// Tap 碼映射表
const TAP_MATRIX = [
  ['A', 'B', 'C', 'D', 'E'],
  ['F', 'G', 'H', 'I', 'J'],
  ['L', 'M', 'N', 'O', 'P'],
  ['Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z'],
  ['K', '0', '1', '2', '3'],
  ['4', '5', '6', '7', '8'],
  ['9', '.', ',', '?', '!']
];

// Phonetic 碼映射表
const PHONETIC_MAP = {
  'A': 'Alpha',   'B': 'Bravo',    'C': 'Charlie',  'D': 'Delta',    'E': 'Echo',
  'F': 'Foxtrot', 'G': 'Golf',     'H': 'Hotel',    'I': 'India',    'J': 'Juliet',
  'K': 'Kilo',    'L': 'Lima',     'M': 'Mike',     'N': 'November', 'O': 'Oscar',
  'P': 'Papa',    'Q': 'Quebec',   'R': 'Romeo',    'S': 'Sierra',   'T': 'Tango',
  'U': 'Uniform', 'V': 'Victor',   'W': 'Whiskey',  'X': 'X-ray',    'Y': 'Yankee',
  'Z': 'Zulu',    '0': 'Zero',     '1': 'One',      '2': 'Two',      '3': 'Three',
  '4': 'Four',    '5': 'Five',     '6': 'Six',      '7': 'Seven',    '8': 'Eight',
  '9': 'Nine',    '.': 'Stop',     ',': 'Comma',    '?': 'Query',    '!': 'Bang'
};

// 反向 Phonetic 映射表
const REVERSE_PHONETIC_MAP = Object.fromEntries(
  Object.entries(PHONETIC_MAP).map(([key, value]) => [value.toLowerCase(), key])
);

/**
 * 將字符轉換為 Tap 碼
 * @param char 要轉換的字符
 * @returns [row, col] 行列位置
 */
function charToTap(char: string): [number, number] {
  const upperChar = char.toUpperCase();
  for (let i = 0; i < TAP_MATRIX.length; i++) {
    const j = TAP_MATRIX[i].indexOf(upperChar);
    if (j !== -1) {
      return [i + 1, j + 1];
    }
  }
  throw new EncoderError(
    EncoderErrorType.INVALID_CHARACTER,
    `無效的 Tap 碼字符: ${char}`
  );
}

/**
 * 將 Tap 碼轉換為字符
 * @param row 行號
 * @param col 列號
 * @returns 對應的字符
 */
function tapToChar(row: number, col: number): string {
  if (row < 1 || row > TAP_MATRIX.length || col < 1 || col > TAP_MATRIX[0].length) {
    throw new EncoderError(
      EncoderErrorType.INVALID_FORMAT,
      `無效的 Tap 碼位置: ${row},${col}`
    );
  }
  return TAP_MATRIX[row - 1][col - 1];
}

/**
 * Tap 碼編碼
 * @param input 輸入字符串
 * @returns Tap 碼字符串
 */
export function encodeTap(input: string): string {
  input = validateInput(input);
  let output = '';
  
  for (const char of input) {
    if (char === ' ') {
      output += '/ ';
      continue;
    }
    
    try {
      const [row, col] = charToTap(char);
      output += `${'.'.repeat(row)} ${'.'.repeat(col)} `;
    } catch (error) {
      if (error instanceof EncoderError) {
        throw error;
      }
      throw new EncoderError(
        EncoderErrorType.INVALID_CHARACTER,
        `無法編碼字符: ${char}`
      );
    }
  }

  return output.trim();
}

/**
 * Tap 碼解碼
 * @param input Tap 碼字符串
 * @returns 解碼後的字符串
 */
export function decodeTap(input: string): string {
  input = validateInput(input);
  let output = '';
  
  const words = input.split('/').map(word => word.trim());
  for (const word of words) {
    if (!word) {
      output += ' ';
      continue;
    }

    const taps = word.split(' ').filter(Boolean);
    if (taps.length % 2 !== 0) {
      throw new EncoderError(
        EncoderErrorType.INVALID_FORMAT,
        '無效的 Tap 碼格式'
      );
    }

    for (let i = 0; i < taps.length; i += 2) {
      const row = taps[i].length;
      const col = taps[i + 1].length;
      try {
        output += tapToChar(row, col);
      } catch (error) {
        if (error instanceof EncoderError) {
          throw error;
        }
        throw new EncoderError(
          EncoderErrorType.INVALID_FORMAT,
          `無效的 Tap 碼: ${taps[i]} ${taps[i + 1]}`
        );
      }
    }
  }

  return output;
}

/**
 * Phonetic 編碼
 * @param input 輸入字符串
 * @returns Phonetic 碼字符串
 */
export function encodePhonetic(input: string): string {
  input = validateInput(input);
  let output = '';
  
  for (const char of input) {
    if (char === ' ') {
      output += '/ ';
      continue;
    }
    
    const upperChar = char.toUpperCase();
    const code = PHONETIC_MAP[upperChar];
    if (!code) {
      throw new EncoderError(
        EncoderErrorType.INVALID_CHARACTER,
        `無效的 Phonetic 碼字符: ${char}`
      );
    }
    output += code + ' ';
  }

  return output.trim();
}

/**
 * Phonetic 解碼
 * @param input Phonetic 碼字符串
 * @returns 解碼後的字符串
 */
export function decodePhonetic(input: string): string {
  input = validateInput(input);
  let output = '';
  
  const words = input.split('/').map(word => word.trim());
  for (const word of words) {
    if (!word) {
      output += ' ';
      continue;
    }

    const codes = word.split(' ').filter(Boolean);
    for (const code of codes) {
      const char = REVERSE_PHONETIC_MAP[code.toLowerCase()];
      if (!char) {
        throw new EncoderError(
          EncoderErrorType.INVALID_FORMAT,
          `無效的 Phonetic 碼: ${code}`
        );
      }
      output += char;
    }
  }

  return output;
} 