import { DecodeMethod, DecoderOptions, DecodeResult } from '../types';
import { analyzeImage, detectSteganography } from './imageProcessing';
import { analyzeAudio, filterAudio } from './audioProcessing';

export class Decoder {
  private static instance: Decoder;
  private decodingHistory: DecodeResult[] = [];

  private constructor() {}

  static getInstance(): Decoder {
    if (!Decoder.instance) {
      Decoder.instance = new Decoder();
    }
    return Decoder.instance;
  }

  async decode(
    input: string | File,
    method: DecodeMethod,
    options: DecoderOptions = {}
  ): Promise<DecodeResult> {
    try {
      let result: DecodeResult;

      // 根據輸入類型和解碼方法選擇相應的解碼器
      if (input instanceof File) {
        result = await this.decodeFile(input, method, options);
      } else {
        result = await this.decodeText(input, method, options);
      }

      // 添加到歷史記錄
      this.decodingHistory.push(result);
      return result;
    } catch (error) {
      const errorResult: DecodeResult = {
        method,
        status: 'error',
        result: error instanceof Error ? error.message : '解碼失敗',
      };
      this.decodingHistory.push(errorResult);
      return errorResult;
    }
  }

  private async decodeFile(
    file: File,
    method: DecodeMethod,
    options: DecoderOptions
  ): Promise<DecodeResult> {
    switch (method) {
      case 'stegano':
        const imageResult = await detectSteganography(file, options);
        return {
          method,
          status: imageResult.success ? 'success' : 'error',
          result: imageResult.data || imageResult.message || '',
          additionalInfo: {
            type: 'image',
            data: imageResult.metadata
          }
        };

      case 'audio-steg':
        const audioResult = await analyzeAudio(file, options);
        return {
          method,
          status: audioResult.hiddenData ? 'success' : 'error',
          result: audioResult.hiddenData || '未發現隱藏數據',
          additionalInfo: {
            type: 'audio',
            data: {
              duration: audioResult.duration,
              sampleRate: audioResult.sampleRate,
              channels: audioResult.numberOfChannels
            }
          }
        };

      case 'morse':
        if (file.type.startsWith('audio/')) {
          const morseResult = await analyzeAudio(file, { variant: 'morse' });
          return {
            method,
            status: morseResult.morseCode ? 'success' : 'error',
            result: morseResult.morseCode || '未檢測到摩斯密碼',
            additionalInfo: {
              type: 'audio',
              data: {
                duration: morseResult.duration,
                sampleRate: morseResult.sampleRate
              }
            }
          };
        }
        throw new Error('不支援的文件類型');

      default:
        throw new Error('不支援的文件解碼方法');
    }
  }

  private async decodeText(
    input: string,
    method: DecodeMethod,
    options: DecoderOptions
  ): Promise<DecodeResult> {
    switch (method) {
      case 'base64':
        return this.decodeBase64(input);
      case 'hex':
        return this.decodeHex(input);
      case 'binary':
        return this.decodeBinary(input);
      case 'caesar':
        return this.decodeCaesar(input, options.shift || 3);
      case 'rot13':
        return this.decodeCaesar(input, 13);
      case 'morse':
        return this.decodeMorse(input);
      case 'bacon':
        return this.decodeBacon(input);
      case 'vigenere':
        if (!options.keyword) {
          throw new Error('維吉尼亞密碼需要關鍵字');
        }
        return this.decodeVigenere(input, options.keyword);
      case 'atbash':
        return this.decodeAtbash(input);
      case 'playfair':
        if (!options.playfairKey) {
          throw new Error('Playfair 密碼需要密鑰');
        }
        return this.decodePlayfair(input, options.playfairKey);
      case 'polybius':
        return this.decodePolybius(input);
      case 'railfence':
        return this.decodeRailFence(input, options.rails || 3);
      case 'affine':
        if (!options.a || !options.b) {
          throw new Error('仿射密碼需要參數 a 和 b');
        }
        return this.decodeAffine(input, options.a, options.b);
      case 'substitution':
        if (!options.substitutionMap) {
          throw new Error('替換密碼需要替換表');
        }
        return this.decodeSubstitution(input, options.substitutionMap);
      default:
        throw new Error('不支援的文本解碼方法');
    }
  }

  private decodeBase64(input: string): DecodeResult {
    try {
      const decoded = atob(input.trim());
      return {
        method: 'base64',
        status: 'success',
        result: decoded
      };
    } catch {
      throw new Error('無效的 Base64 編碼');
    }
  }

  private decodeHex(input: string): DecodeResult {
    const hex = input.replace(/\s/g, '');
    if (!/^[0-9A-Fa-f]+$/.test(hex)) {
      throw new Error('無效的十六進制編碼');
    }
    
    const decoded = hex
      .match(/.{1,2}/g)
      ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
      .join('') || '';
      
    return {
      method: 'hex',
      status: 'success',
      result: decoded
    };
  }

  private decodeBinary(input: string): DecodeResult {
    const binary = input.replace(/\s/g, '');
    if (!/^[01]+$/.test(binary)) {
      throw new Error('無效的二進制編碼');
    }
    
    const decoded = binary
      .match(/.{1,8}/g)
      ?.map(byte => String.fromCharCode(parseInt(byte, 2)))
      .join('') || '';
      
    return {
      method: 'binary',
      status: 'success',
      result: decoded
    };
  }

  private decodeCaesar(input: string, shift: number): DecodeResult {
    const decoded = input
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) { // 大寫字母
          return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
        }
        if (code >= 97 && code <= 122) { // 小寫字母
          return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
        }
        return char;
      })
      .join('');
      
    return {
      method: 'caesar',
      status: 'success',
      result: decoded,
      additionalInfo: {
        type: 'shift',
        data: { shift }
      }
    };
  }

  private decodeMorse(input: string): DecodeResult {
    const morseMap: { [key: string]: string } = {
      '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
      '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
      '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
      '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
      '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
      '--..': 'Z', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
      '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
      '-----': '0', '.-.-.-': '.', '--..--': ',', '..--..': '?'
    };

    const decoded = input
      .trim()
      .split(' ')
      .map(code => morseMap[code] || '')
      .join('');
      
    return {
      method: 'morse',
      status: 'success',
      result: decoded
    };
  }

  private decodeBacon(input: string): DecodeResult {
    const baconMap: { [key: string]: string } = {
      'AAAAA': 'A', 'AAAAB': 'B', 'AAABA': 'C', 'AAABB': 'D', 'AABAA': 'E',
      'AABAB': 'F', 'AABBA': 'G', 'AABBB': 'H', 'ABAAA': 'I', 'ABAAB': 'J',
      'ABABA': 'K', 'ABABB': 'L', 'ABBAA': 'M', 'ABBAB': 'N', 'ABBBA': 'O',
      'ABBBB': 'P', 'BAAAA': 'Q', 'BAAAB': 'R', 'BAABA': 'S', 'BAABB': 'T',
      'BABAA': 'U', 'BABAB': 'V', 'BABBA': 'W', 'BABBB': 'X', 'BBAAA': 'Y',
      'BBAAB': 'Z'
    };

    const normalized = input.toUpperCase().replace(/[^AB]/g, '');
    const decoded = normalized
      .match(/.{5}/g)
      ?.map(code => baconMap[code] || '')
      .join('') || '';
      
    return {
      method: 'bacon',
      status: 'success',
      result: decoded
    };
  }

  private decodeVigenere(input: string, keyword: string): DecodeResult {
    const decoded = input
      .split('')
      .map((char, i) => {
        const code = char.charCodeAt(0);
        const shift = keyword[i % keyword.length].toUpperCase().charCodeAt(0) - 65;
        
        if (code >= 65 && code <= 90) { // 大寫字母
          return String.fromCharCode(((code - 65 - shift) % 26 + 26) % 26 + 65);
        }
        if (code >= 97 && code <= 122) { // 小寫字母
          return String.fromCharCode(((code - 97 - shift) % 26 + 26) % 26 + 97);
        }
        return char;
      })
      .join('');
      
    return {
      method: 'vigenere',
      status: 'success',
      result: decoded,
      additionalInfo: {
        type: 'keyword',
        data: { keyword }
      }
    };
  }

  private decodeAtbash(input: string): DecodeResult {
    const decoded = input
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) { // 大寫字母
          return String.fromCharCode(90 - (code - 65));
        }
        if (code >= 97 && code <= 122) { // 小寫字母
          return String.fromCharCode(122 - (code - 97));
        }
        return char;
      })
      .join('');
      
    return {
      method: 'atbash',
      status: 'success',
      result: decoded
    };
  }

  private decodePlayfair(input: string, key: string): DecodeResult {
    // 創建 5x5 矩陣
    const createMatrix = (key: string) => {
      const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // 不包含 J
      const uniqueChars = [...new Set(key.toUpperCase().replace(/J/g, 'I') + alphabet)];
      const matrix: string[][] = [];
      
      for (let i = 0; i < 5; i++) {
        matrix[i] = uniqueChars.slice(i * 5, (i + 1) * 5);
      }
      
      return matrix;
    };
    
    // 在矩陣中找到字符的位置
    const findPosition = (matrix: string[][], char: string) => {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (matrix[i][j] === char) {
            return { row: i, col: j };
          }
        }
      }
      return null;
    };
    
    const matrix = createMatrix(key);
    const normalized = input.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    let decoded = '';
    
    // 每次處理兩個字符
    for (let i = 0; i < normalized.length; i += 2) {
      const char1 = normalized[i];
      const char2 = normalized[i + 1] || 'X';
      
      const pos1 = findPosition(matrix, char1);
      const pos2 = findPosition(matrix, char2);
      
      if (!pos1 || !pos2) continue;
      
      let newChar1: string, newChar2: string;
      
      if (pos1.row === pos2.row) {
        // 同一行
        newChar1 = matrix[pos1.row][(pos1.col + 4) % 5];
        newChar2 = matrix[pos2.row][(pos2.col + 4) % 5];
      } else if (pos1.col === pos2.col) {
        // 同一列
        newChar1 = matrix[(pos1.row + 4) % 5][pos1.col];
        newChar2 = matrix[(pos2.row + 4) % 5][pos2.col];
      } else {
        // 矩形
        newChar1 = matrix[pos1.row][pos2.col];
        newChar2 = matrix[pos2.row][pos1.col];
      }
      
      decoded += newChar1 + newChar2;
    }
    
    return {
      method: 'playfair',
      status: 'success',
      result: decoded,
      additionalInfo: {
        type: 'matrix',
        data: { matrix }
      }
    };
  }

  private decodePolybius(input: string): DecodeResult {
    const matrix = [
      ['A', 'B', 'C', 'D', 'E'],
      ['F', 'G', 'H', 'I/J', 'K'],
      ['L', 'M', 'N', 'O', 'P'],
      ['Q', 'R', 'S', 'T', 'U'],
      ['V', 'W', 'X', 'Y', 'Z']
    ];
    
    const numbers = input.match(/\d{2}/g);
    if (!numbers) {
      throw new Error('無效的波利比奧斯方陣編碼');
    }
    
    const decoded = numbers
      .map(pair => {
        const row = parseInt(pair[0]) - 1;
        const col = parseInt(pair[1]) - 1;
        return row >= 0 && row < 5 && col >= 0 && col < 5 ? matrix[row][col] : '';
      })
      .join('');
      
    return {
      method: 'polybius',
      status: 'success',
      result: decoded,
      additionalInfo: {
        type: 'matrix',
        data: { matrix }
      }
    };
  }

  private decodeRailFence(input: string, rails: number): DecodeResult {
    const fence: string[][] = Array(rails).fill(null).map(() => []);
    let rail = 0;
    let direction = 1;
    
    // 計算柵欄大小
    for (let i = 0; i < input.length; i++) {
      fence[rail].push('');
      rail += direction;
      
      if (rail === rails - 1 || rail === 0) {
        direction = -direction;
      }
    }
    
    // 填充字符
    let index = 0;
    for (let i = 0; i < rails; i++) {
      for (let j = 0; j < fence[i].length; j++) {
        fence[i][j] = input[index++];
      }
    }
    
    // 讀取解碼結果
    let decoded = '';
    rail = 0;
    direction = 1;
    
    for (let i = 0; i < input.length; i++) {
      decoded += fence[rail].shift() || '';
      rail += direction;
      
      if (rail === rails - 1 || rail === 0) {
        direction = -direction;
      }
    }
    
    return {
      method: 'railfence',
      status: 'success',
      result: decoded,
      additionalInfo: {
        type: 'rails',
        data: { rails }
      }
    };
  }

  private decodeAffine(input: string, a: number, b: number): DecodeResult {
    // 計算乘法逆元
    const modInverse = (a: number, m: number) => {
      for (let x = 1; x < m; x++) {
        if (((a % m) * (x % m)) % m === 1) {
          return x;
        }
      }
      throw new Error('無效的仿射參數 a');
    };
    
    const aInverse = modInverse(a, 26);
    
    const decoded = input
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) { // 大寫字母
          return String.fromCharCode(((aInverse * (code - 65 - b + 26)) % 26 + 26) % 26 + 65);
        }
        if (code >= 97 && code <= 122) { // 小寫字母
          return String.fromCharCode(((aInverse * (code - 97 - b + 26)) % 26 + 26) % 26 + 97);
        }
        return char;
      })
      .join('');
      
    return {
      method: 'affine',
      status: 'success',
      result: decoded,
      additionalInfo: {
        type: 'parameters',
        data: { a, b }
      }
    };
  }

  private decodeSubstitution(
    input: string,
    substitutionMap: { [key: string]: string }
  ): DecodeResult {
    // 創建反向映射
    const reverseMap: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(substitutionMap)) {
      reverseMap[value] = key;
    }
    
    const decoded = input
      .split('')
      .map(char => reverseMap[char] || char)
      .join('');
      
    return {
      method: 'substitution',
      status: 'success',
      result: decoded,
      additionalInfo: {
        type: 'map',
        data: { map: substitutionMap }
      }
    };
  }

  getHistory(): DecodeResult[] {
    return [...this.decodingHistory];
  }

  clearHistory(): void {
    this.decodingHistory = [];
  }
} 