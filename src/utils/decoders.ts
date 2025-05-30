import { DecodeMethod, OperationType, DecoderOptions } from '../types';
import MorseDecoder from './morse';
import { KeyManager } from './keyManager';

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
  // 確保 shift 在有效範圍內
  const effectiveShift = ((shift % 26) + 26) % 26; // 處理負數位移
  
  return input.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const isUpperCase = code >= 65 && code <= 90;
      const base = isUpperCase ? 65 : 97;
      return String.fromCharCode((code - base - effectiveShift + 26) % 26 + base);
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

  // 檢查是否為特殊的 flag 觸發序列
  const triggerSequences = [
    '... --- ... -.-. - ..-.', // SOS CTF
    '.... .. -.. -.. . -. ..-. .-.. .- --.', // HIDDEN FLAG
    '... . -.-. .-. . -', // SECRET
    '..-. .-.. .- --. ..-. --- ..- -. -..' // FLAG FOUND
  ];

  // 檢查是否包含任何觸發序列
  for (const sequence of triggerSequences) {
    if (cleanedInput.includes(sequence)) {
      const decodedSequence = sequence
        .split(' ')
        .map(code => morseDict[code] || '?')
        .join('');
      return {
        morseCode: sequence,
        decodedText: `${decodedSequence}\n\n恭喜你發現了隱藏的 flag！\nNHISCCTF{M0rs3_D3c0d3r_Pr0}`
      };
    }
  }
  
  // 檢查輸入是否包含 "摩斯密碼：" 或 "解密結果："
  if (cleanedInput.includes('摩斯密碼：') || cleanedInput.includes('解密結果：')) {
    const lines = cleanedInput.split('\n');
    let morseCode = '';
    let decodedText = '';
    
    for (const line of lines) {
      if (line.startsWith('摩斯密碼：')) {
        morseCode = line.replace('摩斯密碼：', '').trim();
      } else if (line.startsWith('解密結果：')) {
        decodedText = line.replace('解密結果：', '').trim();
      }
    }
    
    if (!morseCode && !decodedText) {
      morseCode = cleanedInput;
      decodedText = cleanedInput;
    }
    
    return { morseCode, decodedText };
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
      morseCode,
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
    decodedText
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

// Base64 解碼（支援 URL 安全格式）
function decodeBase64(input: string): string {
  try {
    // 處理 URL 安全格式
    const normalizedInput = input
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // 添加缺失的填充
    const pad = normalizedInput.length % 4;
    const paddedInput = pad ? normalizedInput + '='.repeat(4 - pad) : normalizedInput;
    
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(paddedInput)) {
      throw new Error('無效的 Base64 編碼格式');
    }
    
    return atob(paddedInput);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Base64 解碼失敗');
  }
}

function encodeBase64(input: string): string {
  return btoa(input);
}

interface MorseResult {
  morseCode: string;
  decodedText: string;
}

// 十六進制解碼
function decodeHex(input: string): string {
  const cleanedInput = input.replace(/\s/g, '');
  
  if (!/^[0-9A-Fa-f]+$/.test(cleanedInput)) {
    throw new Error('無效的十六進制編碼格式');
  }
  
  if (cleanedInput.length % 2 !== 0) {
    throw new Error('十六進制字符數必須為偶數');
  }
  
  try {
    let result = '';
    for (let i = 0; i < cleanedInput.length; i += 2) {
      const byte = parseInt(cleanedInput.substr(i, 2), 16);
      result += String.fromCharCode(byte);
    }
    return result;
  } catch {
    throw new Error('十六進制解碼失敗');
  }
}

// 二進制解碼
function decodeBinary(input: string): string {
  const cleanedInput = input.replace(/\s/g, '');
  
  if (!/^[01]+$/.test(cleanedInput)) {
    throw new Error('無效的二進制編碼格式');
  }
  
  if (cleanedInput.length % 8 !== 0) {
    throw new Error('二進制位數必須為 8 的倍數');
  }
  
  try {
    const bytes = cleanedInput.match(/.{8}/g) || [];
    return bytes.map(byte => {
      const charCode = parseInt(byte, 2);
      if (charCode > 255) {
        throw new Error('二進制值超出範圍');
      }
      return String.fromCharCode(charCode);
    }).join('');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('二進制解碼失敗');
  }
}

// ASCII 解碼
function decodeAscii(input: string): string {
  const numbers = input.trim().split(/\s+/);
  
  try {
    return numbers.map(num => {
      const code = parseInt(num, 10);
      if (isNaN(code)) {
        throw new Error('無效的 ASCII 碼');
      }
      if (code < 0 || code > 255) {
        throw new Error('ASCII 碼必須在 0-255 範圍內');
      }
      return String.fromCharCode(code);
    }).join('');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ASCII 解碼失敗');
  }
}

// 十進制解碼
function decodeDecimal(input: string): string {
  const numbers = input.trim().split(/\s+/);
  
  try {
    return numbers.map(num => {
      const code = parseInt(num, 10);
      if (isNaN(code)) {
        throw new Error('無效的十進制數');
      }
      if (code < 0 || code > 0x10FFFF) {
        throw new Error('十進制數超出有效範圍');
      }
      return String.fromCharCode(code);
    }).join('');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('十進制解碼失敗');
  }
}

// Base58 解碼
function decodeBase58(input: string): string {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const BASE = ALPHABET.length;
  
  let decoded = 0n;
  for (const char of input) {
    decoded = decoded * BigInt(BASE) + BigInt(ALPHABET.indexOf(char));
  }
  
  let result = '';
  while (decoded > 0n) {
    result = String.fromCharCode(Number(decoded & 0xFFn)) + result;
    decoded = decoded >> 8n;
  }
  
  // 處理前導零
  for (let i = 0; i < input.length && input[i] === '1'; i++) {
    result = '\0' + result;
  }
  
  return result;
}

// Base85 解碼
function decodeBase85(input: string): string {
  const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~";
  
  try {
    let result = '';
    for (let i = 0; i < input.length; i += 5) {
      let value = 0;
      for (let j = 0; j < 5; j++) {
        if (i + j < input.length) {
          value = value * 85 + ALPHABET.indexOf(input[i + j]);
        }
      }
      
      for (let j = 3; j >= 0; j--) {
        if (result.length < Math.ceil((input.length * 4) / 5)) {
          result = String.fromCharCode((value >> (j * 8)) & 0xFF) + result;
        }
      }
    }
    return result;
  } catch {
    throw new Error('無效的 Base85 編碼');
  }
}

// 其他解碼函數
function decodeUrl(input: string): string {
  return decodeURIComponent(input);
}

function encodeUrl(input: string): string {
  return encodeURIComponent(input);
}

// 新增的解密函數

// Base32 解碼
function decodeBase32(input: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanedInput = input.toUpperCase().replace(/=+$/, '');
  
  if (!/^[A-Z2-7]*(?:={0,6})?$/.test(input.toUpperCase())) {
    throw new Error('無效的 Base32 編碼格式');
  }
  
  try {
    const bits = cleanedInput.split('')
      .map(char => {
        const value = alphabet.indexOf(char);
        if (value === -1) throw new Error('無效的 Base32 字符');
        return value.toString(2).padStart(5, '0');
      })
      .join('');
    
    const bytes = bits.match(/.{8}/g) || [];
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Base32 解碼失敗');
  }
}

// Unicode 解碼
function decodeUnicode(input: string): string {
  try {
    return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
      String.fromCharCode(parseInt(hex, 16))
    );
  } catch {
    throw new Error('無效的 Unicode 編碼');
  }
}

// UTF-8 解碼
function decodeUTF8(input: string): string {
  try {
    // 處理十六進制格式
    if (input.includes('\\x')) {
      return input.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => 
        String.fromCharCode(parseInt(hex, 16))
      );
    }
    
    // 處理 URL 編碼格式
    if (input.includes('%')) {
      return decodeURIComponent(input);
    }
    
    // 處理二進制格式
    if (/^[01\s]+$/.test(input)) {
      return input.split(' ')
        .map(byte => String.fromCharCode(parseInt(byte, 2)))
        .join('');
    }
    
    throw new Error('不支援的 UTF-8 編碼格式');
  } catch {
    throw new Error('無效的 UTF-8 編碼');
  }
}

// Atbash 密碼解碼
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
  
  // 驗證輸入
  if (!key) {
    throw new Error('請提供維吉尼亞密鑰');
  }
  
  if (!key.match(/^[A-Za-z]+$/)) {
    throw new Error('維吉尼亞密鑰必須只包含英文字母');
  }
  
  let result = '';
  let keyIndex = 0;
  
  for (const char of input) {
    if (char.match(/[A-Za-z]/)) {
      const isUpperCase = char === char.toUpperCase();
      const charCode = char.toUpperCase().charCodeAt(0);
      const keyChar = key[keyIndex % key.length].toUpperCase();
      const shift = alphabet.indexOf(keyChar);
      
      if (shift === -1) {
        throw new Error('無效的密鑰字符');
      }
      
      const charIndex = alphabet.indexOf(char.toUpperCase());
      if (charIndex === -1) {
        throw new Error('無效的輸入字符');
      }
      
      const newIndex = (charIndex - shift + 26) % 26;
      const newChar = alphabet[newIndex];
      result += isUpperCase ? newChar : newChar.toLowerCase();
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
  
  // 清理輸入
  const cleanInput = input.toUpperCase().replace(/[^AB\s]/g, '');
  
  // 驗證輸入
  if (!cleanInput) {
    throw new Error('請提供培根密碼');
  }
  
  const validInput = cleanInput.replace(/\s/g, '');
  if (validInput.length % 5 !== 0) {
    throw new Error('培根密碼長度必須是 5 的倍數');
  }
  
  try {
    const groups = validInput.match(/.{5}/g) || [];
    return groups.map(group => {
      if (!baconDict[group]) {
        throw new Error(`無效的培根密碼組：${group}`);
      }
      return baconDict[group];
    }).join('');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('培根密碼解碼失敗');
  }
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
  
  // 清理輸入
  const cleanInput = input.replace(/\s/g, '');
  
  // 驗證輸入
  if (!cleanInput) {
    throw new Error('請提供波利比奧斯方陣密碼');
  }
  
  if (!/^\d+$/.test(cleanInput)) {
    throw new Error('波利比奧斯方陣密碼必須只包含數字');
  }
  
  if (cleanInput.length % 2 !== 0) {
    throw new Error('波利比奧斯方陣密碼長度必須是偶數');
  }
  
  try {
    const pairs = cleanInput.match(/\d{2}/g) || [];
    return pairs.map(pair => {
      const [row, col] = pair.split('').map(Number);
      if (row < 1 || row > 5 || col < 1 || col > 5) {
        throw new Error(`無效的坐標：${pair}`);
      }
      return square[row-1][col-1];
    }).join('');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('波利比奧斯方陣解碼失敗');
  }
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
  
  // 清理輸入
  const cleanInput = input.trim();
  
  // 驗證輸入
  if (!cleanInput) {
    throw new Error('請提供敲擊碼');
  }
  
  // 檢查格式
  if (!/^(\d\s\d\s*)+$/.test(cleanInput)) {
    throw new Error('敲擊碼格式錯誤，應為：行號 列號 [行號 列號 ...]');
  }
  
  try {
    const pairs = cleanInput.match(/\d\s\d/g) || [];
    return pairs.map(pair => {
      const [row, col] = pair.split(' ').map(Number);
      if (row < 1 || row > 5 || col < 1 || col > 5) {
        throw new Error(`無效的坐標：${pair}`);
      }
      return tapSquare[row-1][col-1];
    }).join('');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('敲擊碼解碼失敗');
  }
}

// 仿射密碼
function decodeAffine(input: string, a: number, b: number): string {
  // 計算模逆元
  const modInverse = (a: number, m: number): number => {
    for (let x = 1; x < m; x++) {
      if (((a % m) * (x % m)) % m === 1) return x;
    }
    throw new Error(`${a} 與 26 不互質`);
  };
  
  // 驗證參數
  if (a < 1 || a > 25) {
    throw new Error('參數 a 必須在 1-25 之間');
  }
  
  if (b < 0 || b > 25) {
    throw new Error('參數 b 必須在 0-25 之間');
  }
  
  try {
    const aInv = modInverse(a, 26);
    
    return input.split('').map(char => {
      if (char.match(/[A-Za-z]/)) {
        const isUpperCase = char === char.toUpperCase();
        const x = char.toUpperCase().charCodeAt(0) - 65;
        const y = (aInv * (x - b + 26)) % 26;
        const newChar = String.fromCharCode(y + 65);
        return isUpperCase ? newChar : newChar.toLowerCase();
      }
      return char;
    }).join('');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('仿射密碼解碼失敗');
  }
}

// 柵欄密碼
function decodeRailfence(input: string, rails: number): string {
  // 驗證參數
  if (rails < 2) {
    throw new Error('柵欄層數必須大於 1');
  }
  
  if (rails > input.length) {
    throw new Error('柵欄層數不能大於輸入長度');
  }
  
  try {
    // 創建柵欄
    const fence = Array(rails).fill('').map(() => Array(input.length).fill(''));
    let rail = 0;
    let dir = 1;
    
    // 標記柵欄路徑
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
  } catch (error) {
    throw new Error('柵欄密碼解碼失敗');
  }
}

// Playfair 密碼
function decodePlayfair(input: string, key: string): string {
  // 驗證輸入
  if (!key) {
    throw new Error('請提供 Playfair 密鑰');
  }
  
  if (!key.match(/^[A-Za-z]+$/)) {
    throw new Error('Playfair 密鑰必須只包含英文字母');
  }
  
  if (!input.match(/^[A-Za-z\s]+$/)) {
    throw new Error('輸入必須只包含英文字母和空格');
  }
  
  try {
    const matrix = KeyManager.generatePlayfairMatrix(key);
    const pairs = input.replace(/\s/g, '').match(/.{2}/g) || [];
    let result = '';
    
    for (const pair of pairs) {
      const [char1, char2] = pair.split('');
      let pos1 = [-1, -1], pos2 = [-1, -1];
      
      // 找到字符位置
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (matrix[i][j] === char1.toUpperCase()) pos1 = [i, j];
          if (matrix[i][j] === char2.toUpperCase()) pos2 = [i, j];
        }
      }
      
      if (pos1[0] === -1 || pos2[0] === -1) {
        throw new Error('無效的輸入字符');
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
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Playfair 密碼解碼失敗');
  }
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

// 替換密碼解碼
function decodeSubstitution(input: string, substitutionMap: { [key: string]: string }): string {
  return input.toUpperCase().split('').map(char => {
    if (char.match(/[A-Z]/)) {
      return substitutionMap[char] || char;
    }
    return char;
  }).join('');
}

// 更新編碼器映射
const encoders: { [key in DecodeMethod]?: (input: string, options?: DecoderOptions) => string } = {
  base64: (input: string) => btoa(input),
  ascii: (input: string) => input, // TODO
  binary: (input: string) => input, // TODO
  hex: (input: string) => input, // TODO
  decimal: (input: string) => input, // TODO
  url: encodeURIComponent,
  caesar: (input: string, options?: DecoderOptions) => {
    const validation = KeyManager.validateKey('caesar', options || {});
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    // 加密時使用反向位移
    const shift = options?.shift || 13;
    return decodeCaesar(input, 26 - shift);
  },
  rot13: (input: string) => decodeCaesar(input, 13),
  morse: (input: string) => {
    const result = MorseDecoder.textToMorse(input);
    return `${input}\n${result}`;
  },
};

// 更新解碼器映射
const decoders: { [key in DecodeMethod]: (input: string, options?: DecoderOptions) => string | Promise<string> } = {
  // 基礎編碼
  base64: decodeBase64,
  base32: decodeBase32,
  base58: decodeBase58,
  base85: decodeBase85,
  hex: decodeHex,
  binary: decodeBinary,
  ascii: decodeAscii,
  decimal: decodeDecimal,
  url: decodeUrl,
  unicode: decodeUnicode,
  utf8: decodeUTF8,
  base64image: (input: string) => input, // TODO

  // 替換密碼
  caesar: (input: string, options?: DecoderOptions) => {
    const validation = KeyManager.validateKey('caesar', options || {});
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    // 解密時直接使用位移值
    return decodeCaesar(input, options?.shift || 13);
  },
  rot13: decodeRot13,
  atbash: decodeAtbash,
  vigenere: (input: string, options?: DecoderOptions) => {
    const validation = KeyManager.validateKey('vigenere', options || {});
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    return decodeVigenere(input, options?.key || '');
  },
  substitution: (input: string, options?: DecoderOptions) => {
    const validation = KeyManager.validateKey('substitution', options || {});
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    return decodeSubstitution(input, options?.substitutionMap || {});
  },
  affine: (input: string, options?: DecoderOptions) => {
    const validation = KeyManager.validateKey('affine', options || {});
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    return decodeAffine(input, options?.a || 1, options?.b || 0);
  },
  pigpen: (input: string) => input, // TODO
  railfence: (input: string, options?: DecoderOptions) => {
    const validation = KeyManager.validateKey('railfence', options || {});
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    return decodeRailfence(input, options?.rails || 3);
  },
  playfair: (input: string, options?: DecoderOptions) => {
    const validation = KeyManager.validateKey('playfair', options || {});
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    return decodePlayfair(input, options?.playfairKey || '');
  },

  // 古典密碼
  morse: async (input: string) => {
    const result = decodeMorse(input);
    return `解密結果：${result.decodedText}\n摩斯密碼：${result.morseCode}`;
  },
  bacon: decodeBacon,
  polybius: decodePolybius,
  tap: decodeTap,

  // 現代密碼
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

  // 特殊編碼
  brainfuck: decodeBrainfuck,
  jsfuck: decodeJSFuck,
  aaencode: decodeAAencode,
  jother: (input: string) => input, // TODO
  ook: decodeOok,
  uuencode: decodeUUEncode,
  xxencode: decodeXXEncode,
  base91: decodeBase91,

  // 隱寫術
  whitespace: decodeWhitespace,
  'zero-width': decodeZeroWidth,
  stegano: (input: string) => input, // TODO
  'audio-steg': (input: string) => input, // TODO

  // 其他
  reverse: (input: string) => input.split('').reverse().join(''),
  qwerty: decodeQwerty,
  keyboard: decodeKeyboard,
  phonetic: decodePhonetic,
  dna: decodeDNA,
  'hex-color': decodeHexColor
};

// 輸入驗證和清理函數
function validateAndCleanInput(input: string, method: DecodeMethod): string {
  // 移除不必要的空白字符
  let cleanedInput = input.trim();
  
  // 根據不同的解密方法進行特定的驗證和清理
  switch (method) {
    case 'base64':
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanedInput)) {
        throw new Error('無效的 Base64 編碼');
      }
      break;
      
    case 'hex':
      cleanedInput = cleanedInput.replace(/\s/g, '');
      if (!/^[0-9A-Fa-f]+$/.test(cleanedInput)) {
        throw new Error('無效的十六進制編碼');
      }
      break;
      
    case 'binary':
      cleanedInput = cleanedInput.replace(/\s/g, '');
      if (!/^[01]+$/.test(cleanedInput)) {
        throw new Error('無效的二進制編碼');
      }
      break;
      
    case 'decimal':
      cleanedInput = cleanedInput.replace(/\s+/g, ' ');
      if (!/^\d+(\s\d+)*$/.test(cleanedInput)) {
        throw new Error('無效的十進制編碼');
      }
      break;
      
    case 'morse':
      cleanedInput = cleanedInput.replace(/[\r\n]+/g, ' ').trim();
      if (!/^[.-\s/]*$/.test(cleanedInput)) {
        // 如果不是摩斯密碼格式，可能是要編碼的文本
        break;
      }
      break;
      
    case 'bacon':
      cleanedInput = cleanedInput.replace(/[^AB\s]/g, '');
      if (cleanedInput.length % 5 !== 0) {
        throw new Error('無效的培根密碼格式');
      }
      break;
  }
  
  return cleanedInput;
}

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
    // 驗證和清理輸入
    const cleanedInput = validateAndCleanInput(input, method);
    
    const handler = operationType === 'encode' ? encoders[method] : decoders[method];
    if (!handler) {
      throw new Error(`不支援的${operationType === 'encode' ? '加密' : '解密'}方式`);
    }
    
    // 使用清理後的輸入進行處理
    return handler(cleanedInput, options);
  } catch (error) {
    throw new Error(`處理失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

// Brainfuck 解碼
function decodeBrainfuck(input: string): string {
  const memory = new Uint8Array(30000);
  let pointer = 0;
  let output = '';
  let i = 0;
  const bracketStack: number[] = [];
  const bracketMap = new Map<number, number>();
  
  // 首先建立括號匹配映射
  for (i = 0; i < input.length; i++) {
    if (input[i] === '[') {
      bracketStack.push(i);
    } else if (input[i] === ']') {
      if (bracketStack.length === 0) {
        throw new Error('括號不匹配');
      }
      const openBracket = bracketStack.pop()!;
      bracketMap.set(openBracket, i);
      bracketMap.set(i, openBracket);
    }
  }
  
  if (bracketStack.length > 0) {
    throw new Error('括號不匹配');
  }
  
  try {
    for (i = 0; i < input.length; i++) {
      switch (input[i]) {
        case '>':
          if (pointer >= 29999) throw new Error('記憶體指針越界');
          pointer++;
          break;
        case '<':
          if (pointer <= 0) throw new Error('記憶體指針越界');
          pointer--;
          break;
        case '+':
          memory[pointer] = (memory[pointer] + 1) % 256;
          break;
        case '-':
          memory[pointer] = (memory[pointer] - 1 + 256) % 256;
          break;
        case '.':
          output += String.fromCharCode(memory[pointer]);
          break;
        case ',':
          // 在這個實現中，我們不處理輸入
          break;
        case '[':
          if (memory[pointer] === 0) {
            i = bracketMap.get(i) ?? i;
          }
          break;
        case ']':
          if (memory[pointer] !== 0) {
            i = bracketMap.get(i) ?? i;
          }
          break;
      }
    }
    return output;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Brainfuck 解碼失敗');
  }
}

// JSFuck 解碼
function decodeJSFuck(input: string): string {
  try {
    // 安全檢查
    if (!/^[\[\]\(\)\!\+]*$/.test(input)) {
      throw new Error('無效的 JSFuck 編碼');
    }
    
    // 使用 Function 構造器而不是 eval
    const result = new Function(`return ${input}`)();
    return String(result);
  } catch (error) {
    throw new Error('JSFuck 解碼失敗');
  }
}

// UUEncode 解碼
function decodeUUEncode(input: string): string {
  try {
    const lines = input.trim().split('\n');
    let result = '';
    
    // 檢查開始和結束標記
    if (!lines[0].startsWith('begin ')) {
      throw new Error('缺少 UUEncode 開始標記');
    }
    if (lines[lines.length - 1] !== 'end') {
      throw new Error('缺少 UUEncode 結束標記');
    }
    
    // 解碼每一行
    for (let i = 1; i < lines.length - 1; i++) {
      const line = lines[i];
      const length = line.charCodeAt(0) - 32;
      
      if (length < 0 || length > 63) {
        throw new Error(`無效的長度字符：${line[0]}`);
      }
      
      let decoded = '';
      for (let j = 1; j < line.length; j += 4) {
        if (j + 3 >= line.length) break;
        
        const chars = line.slice(j, j + 4).split('').map(c => c.charCodeAt(0) - 32);
        const bytes = [
          ((chars[0] << 2) | (chars[1] >> 4)) & 0xff,
          ((chars[1] << 4) | (chars[2] >> 2)) & 0xff,
          ((chars[2] << 6) | chars[3]) & 0xff
        ];
        
        decoded += bytes.map(b => String.fromCharCode(b)).join('');
      }
      
      result += decoded.slice(0, length);
    }
    
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('UUEncode 解碼失敗');
  }
}

// XXEncode 解碼
function decodeXXEncode(input: string): string {
  try {
    const xxDict = "+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const lines = input.trim().split('\n');
    let result = '';
    
    // 檢查開始和結束標記
    if (!lines[0].startsWith('begin ')) {
      throw new Error('缺少 XXEncode 開始標記');
    }
    if (lines[lines.length - 1] !== 'end') {
      throw new Error('缺少 XXEncode 結束標記');
    }
    
    // 解碼每一行
    for (let i = 1; i < lines.length - 1; i++) {
      const line = lines[i];
      const length = xxDict.indexOf(line[0]);
      
      if (length < 0) {
        throw new Error(`無效的長度字符：${line[0]}`);
      }
      
      let decoded = '';
      for (let j = 1; j < line.length; j += 4) {
        if (j + 3 >= line.length) break;
        
        const chars = line.slice(j, j + 4).split('').map(c => xxDict.indexOf(c));
        const bytes = [
          ((chars[0] << 2) | (chars[1] >> 4)) & 0xff,
          ((chars[1] << 4) | (chars[2] >> 2)) & 0xff,
          ((chars[2] << 6) | chars[3]) & 0xff
        ];
        
        decoded += bytes.map(b => String.fromCharCode(b)).join('');
      }
      
      result += decoded.slice(0, length);
    }
    
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('XXEncode 解碼失敗');
  }
}

// Base91 解碼
function decodeBase91(input: string): string {
  try {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
    let result = '';
    let n = 0;
    let v = -1;
    
    for (let i = 0; i < input.length; i++) {
      const p = alphabet.indexOf(input[i]);
      if (p === -1) continue;
      
      if (v < 0) {
        v = p;
      } else {
        v += p * 91;
        n |= v << 13;
        do {
          result += String.fromCharCode(n & 0xFF);
          n >>= 8;
        } while (n > 0);
        v = -1;
      }
    }
    
    if (v > -1) {
      result += String.fromCharCode((n | v) & 0xFF);
    }
    
    return result;
  } catch (error) {
    throw new Error('Base91 解碼失敗');
  }
}

// Ook! 解碼
function decodeOok(input: string): string {
  try {
    // 將 Ook! 代碼轉換為 Brainfuck
    const ookToBf: { [key: string]: string } = {
      'Ook. Ook?': '>',
      'Ook? Ook.': '<',
      'Ook. Ook.': '+',
      'Ook! Ook!': '-',
      'Ook! Ook.': '.',
      'Ook. Ook!': ',',
      'Ook! Ook?': '[',
      'Ook? Ook!': ']'
    };
    
    // 清理輸入並轉換為 Brainfuck
    const bfCode = input
      .replace(/\s+/g, ' ')
      .match(/Ook[!?.][\s]+Ook[!?.]/g)
      ?.map(code => ookToBf[code] || '')
      .join('') || '';
    
    // 使用 Brainfuck 解碼器
    return decodeBrainfuck(bfCode);
  } catch (error) {
    throw new Error('Ook! 解碼失敗');
  }
}

// QWERTY 鍵盤密碼
function decodeQwerty(input: string): string {
  const qwertyMap: { [key: string]: string } = {
    'Q': 'A', 'W': 'B', 'E': 'C', 'R': 'D', 'T': 'E',
    'Y': 'F', 'U': 'G', 'I': 'H', 'O': 'I', 'P': 'J',
    'A': 'K', 'S': 'L', 'D': 'M', 'F': 'N', 'G': 'O',
    'H': 'P', 'J': 'Q', 'K': 'R', 'L': 'S', ';': 'T',
    'Z': 'U', 'X': 'V', 'C': 'W', 'V': 'X', 'B': 'Y',
    'N': 'Z', 'M': ' '
  };
  
  return input.split('').map(char => {
    const upperChar = char.toUpperCase();
    return qwertyMap[upperChar] || char;
  }).join('');
}

// 鍵盤布局密碼
function decodeKeyboard(input: string): string {
  const keyboardMap: { [key: string]: string } = {
    // 標準 QWERTY 鍵盤布局映射
    '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
    '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
    'Q': 'W', 'W': 'E', 'E': 'R', 'R': 'T', 'T': 'Y',
    'Y': 'U', 'U': 'I', 'I': 'O', 'O': 'P', 'P': '[',
    'A': 'S', 'S': 'D', 'D': 'F', 'F': 'G', 'G': 'H',
    'H': 'J', 'J': 'K', 'K': 'L', 'L': ';',
    'Z': 'X', 'X': 'C', 'C': 'V', 'V': 'B', 'B': 'N',
    'N': 'M', 'M': ',', ',': '.', '.': '/'
  };
  
  return input.split('').map(char => {
    const upperChar = char.toUpperCase();
    return keyboardMap[upperChar] || char;
  }).join('');
}

// 音標密碼
function decodePhonetic(input: string): string {
  const phoneticMap: { [key: string]: string } = {
    'ALPHA': 'A', 'BRAVO': 'B', 'CHARLIE': 'C', 'DELTA': 'D',
    'ECHO': 'E', 'FOXTROT': 'F', 'GOLF': 'G', 'HOTEL': 'H',
    'INDIA': 'I', 'JULIETT': 'J', 'KILO': 'K', 'LIMA': 'L',
    'MIKE': 'M', 'NOVEMBER': 'N', 'OSCAR': 'O', 'PAPA': 'P',
    'QUEBEC': 'Q', 'ROMEO': 'R', 'SIERRA': 'S', 'TANGO': 'T',
    'UNIFORM': 'U', 'VICTOR': 'V', 'WHISKEY': 'W', 'XRAY': 'X',
    'YANKEE': 'Y', 'ZULU': 'Z'
  };
  
  // 將輸入按空格分割
  const words = input.toUpperCase().split(' ');
  
  // 解碼每個單詞
  return words.map(word => {
    // 檢查是否是音標代碼
    if (phoneticMap[word]) {
      return phoneticMap[word];
    }
    // 檢查是否是數字的音標代碼
    switch (word) {
      case 'ONE': return '1';
      case 'TWO': return '2';
      case 'THREE': return '3';
      case 'FOUR': return '4';
      case 'FIVE': return '5';
      case 'SIX': return '6';
      case 'SEVEN': return '7';
      case 'EIGHT': return '8';
      case 'NINE': return '9';
      case 'ZERO': return '0';
      default: return word;
    }
  }).join('');
}

// 顏色代碼轉換
function decodeHexColor(input: string): string {
  // 移除所有空白字符
  const cleanInput = input.replace(/\s/g, '');
  
  // 檢查是否是有效的十六進制顏色代碼
  if (!/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(cleanInput)) {
    throw new Error('無效的十六進制顏色代碼');
  }
  
  // 如果沒有 #，添加它
  const hex = cleanInput.startsWith('#') ? cleanInput : `#${cleanInput}`;
  
  // 如果是簡寫形式，展開它
  let fullHex = hex;
  if (hex.length === 4) {
    fullHex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  
  // 將十六進制轉換為 RGB
  const r = parseInt(fullHex.slice(1, 3), 16);
  const g = parseInt(fullHex.slice(3, 5), 16);
  const b = parseInt(fullHex.slice(5, 7), 16);
  
  // 返回顏色信息
  return JSON.stringify({
    hex: fullHex.toUpperCase(),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: rgbToHsl(r, g, b),
    name: getColorName(r, g, b)
  }, null, 2);
}

// RGB 轉 HSL
function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    
    h /= 6;
  }
  
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

// 獲取顏色名稱（簡單版本）
function getColorName(r: number, g: number, b: number): string {
  const colorNames: { [key: string]: [number, number, number] } = {
    'BLACK': [0, 0, 0],
    'WHITE': [255, 255, 255],
    'RED': [255, 0, 0],
    'GREEN': [0, 255, 0],
    'BLUE': [0, 0, 255],
    'YELLOW': [255, 255, 0],
    'CYAN': [0, 255, 255],
    'MAGENTA': [255, 0, 255],
    'GRAY': [128, 128, 128]
  };
  
  let minDistance = Infinity;
  let closestColor = 'UNKNOWN';
  
  for (const [name, [r2, g2, b2]] of Object.entries(colorNames)) {
    const distance = Math.sqrt(
      Math.pow(r - r2, 2) +
      Math.pow(g - g2, 2) +
      Math.pow(b - b2, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = name;
    }
  }
  
  return closestColor;
}