import { DecodeMethod, OperationType } from '../types';
import MorseDecoder from './morse';

interface DecoderOptions {
  key?: string;
  rails?: number;
  shift?: number;
  a?: number;  // 添加仿射密碼參數
  b?: number;  // 添加仿射密碼參數
}

interface MorseResult {
  morseCode: string;
  decodedText: string;
}

// 摩斯密碼音頻參數
const MORSE_AUDIO_CONFIG = {
  dotLength: 0.1,  // 點的長度（秒）
  dashLength: 0.3, // 劃的長度（秒）
  pauseLength: 0.1, // 字符間暫停長度（秒）
  wordPauseLength: 0.7, // 單詞間暫停長度（秒）
  frequency: 700,  // 音頻頻率（Hz）
};

// 創建音頻上下文
let audioContext: AudioContext | null = null;

// 生成摩斯密碼音頻
export async function generateMorseAudio(morseCode: string): Promise<AudioBuffer> {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  const sampleRate = audioContext.sampleRate;
  const dotSamples = Math.floor(MORSE_AUDIO_CONFIG.dotLength * sampleRate);
  const dashSamples = Math.floor(MORSE_AUDIO_CONFIG.dashLength * sampleRate);
  const pauseSamples = Math.floor(MORSE_AUDIO_CONFIG.pauseLength * sampleRate);
  const wordPauseSamples = Math.floor(MORSE_AUDIO_CONFIG.wordPauseLength * sampleRate);

  // 計算總樣本數
  let totalSamples = 0;
  for (const char of morseCode) {
    switch (char) {
      case '.': totalSamples += dotSamples + pauseSamples; break;
      case '-': totalSamples += dashSamples + pauseSamples; break;
      case ' ': totalSamples += wordPauseSamples; break;
    }
  }

  // 創建音頻緩衝區
  const audioBuffer = audioContext.createBuffer(1, totalSamples, sampleRate);
  const channel = audioBuffer.getChannelData(0);

  let currentSample = 0;
  for (const char of morseCode) {
    const samples = char === '.' ? dotSamples : char === '-' ? dashSamples : 0;
    if (samples > 0) {
      // 生成音頻信號
      for (let i = 0; i < samples; i++) {
        channel[currentSample + i] = Math.sin(2 * Math.PI * MORSE_AUDIO_CONFIG.frequency * i / sampleRate);
      }
      currentSample += samples;
      
      // 添加字符間暫停
      currentSample += pauseSamples;
    } else if (char === ' ') {
      // 添加單詞間暫停
      currentSample += wordPauseSamples;
    }
  }

  return audioBuffer;
}

// Caesar 密碼解碼
function decodeCaesar(input: string, shift: number = 13): string {
  return input.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const isUpperCase = code >= 65 && code <= 90;
      const base = isUpperCase ? 65 : 97;
      return String.fromCharCode((code - base + (26 - shift)) % 26 + base);
    }
    return char;
  }).join('');
}

// ROT13 解碼（特殊的 Caesar 密碼，位移 13 位）
function decodeRot13(input: string): string {
  return decodeCaesar(input, 13);
}

// Morse 密碼解碼
function decodeMorse(input: string): MorseResult {
  const morseDict: { [key: string]: string } = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
    '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
    '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
    '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
    '--..': 'Z', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
    '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
    '-----': '0', '.-.-.-': '.', '--..--': ',', '..--..': '?', '.----.': "'",
    '-.-.--': '!', '-..-.': '/', '-.--.': '(', '-.--.-': ')', '.-...': '&',
    '---...': ':', '-.-.-.': ';', '-...-': '=', '.-.-.': '+', '-....-': '-',
    '..--.-': '_', '.-..-.': '"', '...-..-': '$', '.--.-.': '@', '...---...': 'SOS'
  };

  // 清理輸入，移除多餘的空格
  const cleanedInput = input.trim().replace(/\s+/g, ' ');
  
  // 檢查輸入是否包含 "摩斯密碼：" 或 "解密結果："
  if (cleanedInput.includes('摩斯密碼：') || cleanedInput.includes('解密結果：')) {
    // 如果包含，直接返回原始輸入
    return {
      morseCode: cleanedInput,
      decodedText: cleanedInput
    };
  }

  // 如果輸入是文字，轉換為摩斯密碼
  if (/^[A-Za-z0-9\s.,?!'"/()&:;=+\-_"$@]+$/.test(cleanedInput)) {
    const morseCode = cleanedInput.toUpperCase().split('').map(char => {
      if (char === ' ') return '/';
      for (const [code, letter] of Object.entries(morseDict)) {
        if (letter === char) return code;
      }
      return char;
    }).join(' ');
    
    return {
      morseCode: morseCode,
      decodedText: cleanedInput.toUpperCase()
    };
  }
  
  // 如果輸入是摩斯密碼，轉換為文字
  const words = cleanedInput.split(' / ');
  const decodedText = words.map(word => {
    return word.split(' ').map(code => morseDict[code] || code).join('');
  }).join(' ');

  return {
    morseCode: cleanedInput,
    decodedText: decodedText
  };
}

// AAEncode 解碼
function decodeAAencode(input: string): string {
  try {
    // 檢查是否是有效的 aaencode 格式
    if (!input.includes('(ﾟДﾟ)')) {
      throw new Error('無效的 aaencode 格式');
    }

    // 提取數字部分
    const numbers = input.match(/\'(\d+)\'/g);
    if (!numbers) {
      throw new Error('無法解析 aaencode');
    }

    // 將八進制數字轉換回字符
    let decoded = '';
    for (const num of numbers) {
      const charCode = parseInt(num.replace(/'/g, ''), 8);
      decoded += String.fromCharCode(charCode);
    }

    // 移除 JavaScript 字符串的引號
    return decoded.slice(1, -1);
  } catch (error) {
    throw new Error('aaencode 解碼失敗');
  }
}

// AAEncode 加密
function encodeAAencode(input: string): string {
  // 將輸入字符串轉換為 JavaScript 代碼
  const jsCode = `'${input}'`;
  
  // 生成 aaencode 格式的代碼
  let encoded = '(ﾟДﾟ) [\'_\'] = ';
  
  // 將每個字符轉換為 aaencode 格式
  for (let i = 0; i < jsCode.length; i++) {
    const char = jsCode.charCodeAt(i);
    encoded += '(ﾟΘﾟ) + ';
    encoded += `'${char.toString(8)}' + `;
  }
  
  // 添加結尾
  encoded = encoded.slice(0, -3); // 移除最後的 ' + '
  encoded += ';';
  
  return encoded;
}

// 其他解碼函數
function decodeBase64(input: string): string {
  return atob(input);
}

function encodeBase64(input: string): string {
  return btoa(input);
}

function decodeAscii(input: string): string {
  return input.split(' ')
    .map(num => String.fromCharCode(parseInt(num)))
    .join('');
}

function encodeAscii(input: string): string {
  return input.split('')
    .map(char => char.charCodeAt(0).toString())
    .join(' ');
}

function decodeBinary(input: string): string {
  return input.split(' ')
    .map(bin => String.fromCharCode(parseInt(bin, 2)))
    .join('');
}

function encodeBinary(input: string): string {
  return input.split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

function decodeHex(input: string): string {
  return input.split(' ')
    .map(hex => String.fromCharCode(parseInt(hex, 16)))
    .join('');
}

function encodeHex(input: string): string {
  return input.split('')
    .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join(' ');
}

function decodeDecimal(input: string): string {
  return input.split(' ')
    .map(num => String.fromCharCode(parseInt(num, 10)))
    .join('');
}

function encodeDecimal(input: string): string {
  return input.split('')
    .map(char => char.charCodeAt(0).toString(10))
    .join(' ');
}

function decodeUrl(input: string): string {
  return decodeURIComponent(input);
}

function encodeUrl(input: string): string {
  return encodeURIComponent(input);
}

// 新增的解密函數

// Base32 解碼
function decodeBase32(input: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=';
  const bits = input.toUpperCase().split('')
    .map(char => alphabet.indexOf(char).toString(2).padStart(5, '0'))
    .join('');
  const bytes = bits.match(/.{8}/g) || [];
  return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
}

// Base58 解碼
function decodeBase58(input: string): string {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = 0n;
  for (const char of input) {
    n = n * 58n + BigInt(ALPHABET.indexOf(char));
  }
  return n.toString(16).match(/.{2}/g)?.map(hex => String.fromCharCode(parseInt(hex, 16))).join('') || '';
}

// Atbash 密碼
function decodeAtbash(input: string): string {
  return input.split('').map(char => {
    if (char.match(/[A-Z]/)) {
      return String.fromCharCode(90 - (char.charCodeAt(0) - 65));
    }
    if (char.match(/[a-z]/)) {
      return String.fromCharCode(122 - (char.charCodeAt(0) - 97));
    }
    return char;
  }).join('');
}

// 維吉尼亞密碼
function decodeVigenere(input: string, key: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  let keyIndex = 0;
  
  for (const char of input.toUpperCase()) {
    if (alphabet.includes(char)) {
      const shift = alphabet.indexOf(key[keyIndex % key.length].toUpperCase());
      const charIndex = alphabet.indexOf(char);
      const newIndex = (charIndex - shift + 26) % 26;
      result += alphabet[newIndex];
      keyIndex++;
    } else {
      result += char;
    }
  }
  
  return result;
}

// 培根密碼
function decodeBacon(input: string): string {
  const baconDict: { [key: string]: string } = {
    'AAAAA': 'A', 'AAAAB': 'B', 'AAABA': 'C', 'AAABB': 'D', 'AABAA': 'E',
    'AABAB': 'F', 'AABBA': 'G', 'AABBB': 'H', 'ABAAA': 'I', 'ABAAB': 'J',
    'ABABA': 'K', 'ABABB': 'L', 'ABBAA': 'M', 'ABBAB': 'N', 'ABBBA': 'O',
    'ABBBB': 'P', 'BAAAA': 'Q', 'BAAAB': 'R', 'BAABA': 'S', 'BAABB': 'T',
    'BABAA': 'U', 'BABAB': 'V', 'BABBA': 'W', 'BABBB': 'X', 'BBAAA': 'Y',
    'BBAAB': 'Z'
  };
  
  const cleanInput = input.replace(/[^AB]/g, '');
  const groups = cleanInput.match(/.{5}/g) || [];
  return groups.map(group => baconDict[group] || '?').join('');
}

// 波利比奧斯方陣
function decodePolybius(input: string): string {
  const square = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'K'],
    ['L', 'M', 'N', 'O', 'P'],
    ['Q', 'R', 'S', 'T', 'U'],
    ['V', 'W', 'X', 'Y', 'Z']
  ];
  
  const pairs = input.match(/\d{2}/g) || [];
  return pairs.map(pair => {
    const [row, col] = pair.split('').map(Number);
    return row >= 1 && row <= 5 && col >= 1 && col <= 5 ? square[row-1][col-1] : '?';
  }).join('');
}

// 敲擊碼
function decodeTap(input: string): string {
  const tapSquare = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['L', 'M', 'N', 'O', 'P'],
    ['Q', 'R', 'S', 'T', 'U'],
    ['V', 'W', 'X', 'Y', 'Z']
  ];
  
  const pairs = input.match(/\d\s\d/g) || [];
  return pairs.map(pair => {
    const [row, col] = pair.split(' ').map(Number);
    return row >= 1 && row <= 5 && col >= 1 && col <= 5 ? tapSquare[row-1][col-1] : '?';
  }).join('');
}

// 仿射密碼
function decodeAffine(input: string, a: number, b: number): string {
  const modInverse = (a: number, m: number): number => {
    for (let x = 1; x < m; x++) {
      if (((a % m) * (x % m)) % m === 1) return x;
    }
    return 1;
  };
  
  return input.split('').map(char => {
    if (char.match(/[A-Z]/)) {
      const x = char.charCodeAt(0) - 65;
      const aInv = modInverse(a, 26);
      const y = (aInv * (x - b + 26)) % 26;
      return String.fromCharCode(y + 65);
    }
    return char;
  }).join('');
}

// 柵欄密碼
function decodeRailfence(input: string, rails: number): string {
  const fence = Array(rails).fill('').map(() => Array(input.length).fill(''));
  let rail = 0;
  let dir = 1;
  
  // 建立柵欄模式
  for (let i = 0; i < input.length; i++) {
    fence[rail][i] = '*';
    rail += dir;
    if (rail === 0 || rail === rails - 1) dir *= -1;
  }
  
  // 填充字符
  let index = 0;
  for (let i = 0; i < rails; i++) {
    for (let j = 0; j < input.length; j++) {
      if (fence[i][j] === '*' && index < input.length) {
        fence[i][j] = input[index++];
      }
    }
  }
  
  // 讀取結果
  let result = '';
  rail = 0;
  dir = 1;
  for (let i = 0; i < input.length; i++) {
    result += fence[rail][i];
    rail += dir;
    if (rail === 0 || rail === rails - 1) dir *= -1;
  }
  
  return result;
}

// Playfair 密碼
function decodePlayfair(input: string, key: string): string {
  // 生成 5x5 方陣
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // 注意：I/J 合併
  const matrix = Array(5).fill('').map(() => Array(5).fill(''));
  const used = new Set();
  let row = 0, col = 0;
  
  // 填充密鑰
  for (const char of key.toUpperCase().replace(/J/g, 'I')) {
    if (!used.has(char) && alphabet.includes(char)) {
      matrix[row][col] = char;
      used.add(char);
      col++;
      if (col === 5) {
        col = 0;
        row++;
      }
    }
  }
  
  // 填充剩餘字母
  for (const char of alphabet) {
    if (!used.has(char)) {
      matrix[row][col] = char;
      col++;
      if (col === 5) {
        col = 0;
        row++;
      }
    }
  }
  
  // 解密
  const pairs = input.match(/.{2}/g) || [];
  let result = '';
  
  for (const pair of pairs) {
    const [char1, char2] = pair.split('');
    let pos1 = [-1, -1], pos2 = [-1, -1];
    
    // 找到字符位置
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (matrix[i][j] === char1) pos1 = [i, j];
        if (matrix[i][j] === char2) pos2 = [i, j];
      }
    }
    
    if (pos1[0] === pos2[0]) { // 同一行
      result += matrix[pos1[0]][(pos1[1] - 1 + 5) % 5];
      result += matrix[pos2[0]][(pos2[1] - 1 + 5) % 5];
    } else if (pos1[1] === pos2[1]) { // 同一列
      result += matrix[(pos1[0] - 1 + 5) % 5][pos1[1]];
      result += matrix[(pos2[0] - 1 + 5) % 5][pos2[1]];
    } else { // 矩形
      result += matrix[pos1[0]][pos2[1]];
      result += matrix[pos2[0]][pos1[1]];
    }
  }
  
  return result;
}

// 空白字符隱寫
function decodeWhitespace(input: string): string {
  return input.split('')
    .map(char => char === ' ' ? '0' : char === '\t' ? '1' : '')
    .join('')
    .match(/.{8}/g)
    ?.map(byte => String.fromCharCode(parseInt(byte, 2)))
    .join('') || '';
}

// 零寬字符隱寫
function decodeZeroWidth(input: string): string {
  return input.split('')
    .map(char => {
      switch (char) {
        case '\u200b': return '0'; // 零寬空格
        case '\u200c': return '1'; // 零寬不連字
        case '\u200d': return ' '; // 零寬連字
        default: return '';
      }
    })
    .join('')
    .match(/.{8}/g)
    ?.map(byte => String.fromCharCode(parseInt(byte, 2)))
    .join('') || '';
}

// DNA 密碼
function decodeDNA(input: string): string {
  const dnaDict: { [key: string]: string } = {
    'AAA': 'A', 'AAC': 'B', 'AAG': 'C', 'AAT': 'D',
    'ACA': 'E', 'ACC': 'F', 'ACG': 'G', 'ACT': 'H',
    'AGA': 'I', 'AGC': 'J', 'AGG': 'K', 'AGT': 'L',
    'ATA': 'M', 'ATC': 'N', 'ATG': 'O', 'ATT': 'P',
    'CAA': 'Q', 'CAC': 'R', 'CAG': 'S', 'CAT': 'T',
    'CCA': 'U', 'CCC': 'V', 'CCG': 'W', 'CCT': 'X',
    'CGA': 'Y', 'CGC': 'Z', 'CGG': '0', 'CGT': '1',
    'CTA': '2', 'CTC': '3', 'CTG': '4', 'CTT': '5',
    'GAA': '6', 'GAC': '7', 'GAG': '8', 'GAT': '9',
    'GCA': ' ', 'GCC': '.', 'GCG': ',', 'GCT': '!'
  };
  
  const codons = input.match(/.{3}/g) || [];
  return codons.map(codon => dnaDict[codon] || '?').join('');
}

// 更新編碼器映射
const encoders: { [key in DecodeMethod]?: (input: string, options?: DecoderOptions) => string } = {
  base64: encodeBase64,
  ascii: encodeAscii,
  binary: encodeBinary,
  hex: encodeHex,
  decimal: encodeDecimal,
  url: encodeUrl,
  caesar: (input: string, options?: DecoderOptions) => decodeCaesar(input, 26 - (options?.shift || 13)),
  rot13: (input: string) => decodeRot13(input),
  morse: (input: string) => {
    const result = MorseDecoder.textToMorse(input);
    return `${input}\n${result}`;
  },
  aaencode: encodeAAencode,
};

// 更新解碼器映射
const decoders: { [key in DecodeMethod]: (input: string, options?: DecoderOptions) => string | Promise<string> } = {
  base64: decodeBase64,
  base32: decodeBase32,
  base58: decodeBase58,
  base85: (input: string) => input, // TODO: 實現 Base85 解碼
  base64image: (input: string) => input, // 添加 base64image 解碼器
  hex: decodeHex,
  binary: decodeBinary,
  ascii: decodeAscii,
  decimal: decodeDecimal,
  url: decodeUrl,
  unicode: (input: string) => input, // TODO: 實現 Unicode 解碼
  utf8: (input: string) => input, // TODO: 實現 UTF-8 解碼
  caesar: (input: string, options?: DecoderOptions) => decodeCaesar(input, options?.shift),
  rot13: decodeRot13,
  atbash: decodeAtbash,
  vigenere: (input: string, options?: DecoderOptions) => decodeVigenere(input, options?.key || ''),
  substitution: (input: string) => input, // TODO: 實現替換密碼解碼
  affine: (input: string, options?: DecoderOptions) => decodeAffine(input, options?.a || 1, options?.b || 0),
  pigpen: (input: string) => input, // TODO: 實現豬圈密碼解碼
  railfence: (input: string, options?: DecoderOptions) => decodeRailfence(input, options?.rails || 3),
  playfair: (input: string, options?: DecoderOptions) => decodePlayfair(input, options?.key || ''),
  morse: async (input: string) => {
    // 檢查輸入是否為空
    if (!input || input.trim().length === 0) {
      return '請輸入要解碼的摩斯密碼';
    }

    try {
      // 如果輸入已經包含標籤，直接返回
      if (input.includes('摩斯密碼：') || input.includes('解密結果：')) {
        return input;
      }

      // 解碼摩斯密碼
      const decodedText = MorseDecoder.decodeMorseCode(input);
      return `解密結果：${decodedText}\n摩斯密碼：${input}`;
    } catch (error) {
      return `處理失敗：${error instanceof Error ? error.message : '未知錯誤'}`;
    }
  },
  bacon: decodeBacon,
  polybius: decodePolybius,
  tap: decodeTap,
  md5: (input: string) => input, // 僅用於檢查，不能解碼
  sha1: (input: string) => input, // 僅用於檢查，不能解碼
  sha256: (input: string) => input, // 僅用於檢查，不能解碼
  sha512: (input: string) => input, // 僅用於檢查，不能解碼
  jwt: (input: string) => {
    const [header, payload] = input.split('.').slice(0, 2);
    return JSON.stringify({
      header: JSON.parse(atob(header)),
      payload: JSON.parse(atob(payload))
    }, null, 2);
  },
  brainfuck: (input: string) => input, // TODO: 實現 Brainfuck 解碼
  jsfuck: (input: string) => input, // TODO: 實現 JSFuck 解碼
  aaencode: decodeAAencode,
  jother: (input: string) => input, // TODO: 實現 Jother 解碼
  ook: (input: string) => input, // TODO: 實現 Ook! 解碼
  uuencode: (input: string) => input, // TODO: 實現 UUencode 解碼
  xxencode: (input: string) => input, // TODO: 實現 XXencode 解碼
  base91: (input: string) => input, // TODO: 實現 Base91 解碼
  whitespace: decodeWhitespace,
  'zero-width': decodeZeroWidth,
  stegano: (input: string) => input, // TODO: 實現圖片隱寫解碼
  'audio-steg': (input: string) => input, // TODO: 實現音頻隱寫解碼
  reverse: (input: string) => input.split('').reverse().join(''),
  qwerty: (input: string) => input, // TODO: 實現 QWERTY 鍵盤密碼解碼
  keyboard: (input: string) => input, // TODO: 實現鍵盤布局密碼解碼
  phonetic: (input: string) => input, // TODO: 實現音標密碼解碼
  dna: decodeDNA,
  'hex-color': (input: string) => input, // TODO: 實現顏色代碼轉換
};

// 解碼函數
export async function decodeWithMethod(
  method: DecodeMethod,
  input: string,
  options: DecoderOptions = {},
  operationType: OperationType = 'decode'
): Promise<string> {
  if (!input.trim()) {
    throw new Error('請輸入要處理的內容');
  }

  try {
    const handler = operationType === 'encode' ? encoders[method] : decoders[method];
    if (!handler) {
      throw new Error(`不支援的${operationType === 'encode' ? '加密' : '解密'}方式`);
    }
    return handler(input, options);
  } catch (error) {
    throw new Error(`處理失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

// 移除重複的導出
// export { generateMorseAudio }; 