import { DecoderOptions } from '../types';

export class KeyManager {
  /**
   * 驗證密鑰是否有效
   * @param method 解密方法
   * @param options 解密選項
   * @returns 驗證結果和錯誤信息
   */
  static validateKey(method: string, options: DecoderOptions): { isValid: boolean; error?: string } {
    switch (method) {
      case 'vigenere':
        if (!options.key?.match(/^[A-Za-z]+$/)) {
          return { isValid: false, error: '維吉尼亞密鑰必須只包含英文字母' };
        }
        break;
      
      case 'playfair':
        if (!options.playfairKey?.match(/^[A-Za-z]+$/)) {
          return { isValid: false, error: 'Playfair 密鑰必須只包含英文字母' };
        }
        break;
      
      case 'railfence':
        const rails = options.rails || 0;
        if (rails < 2 || rails > 20) {
          return { isValid: false, error: '柵欄層數必須在 2-20 之間' };
        }
        break;
      
      case 'affine':
        const a = options.a || 0;
        if (a < 1 || a > 25 || !this.isCoprime(a, 26)) {
          return { isValid: false, error: '仿射參數 a 必須與 26 互質' };
        }
        break;
      
      case 'substitution':
        if (!options.substitutionMap || Object.keys(options.substitutionMap).length !== 26) {
          return { isValid: false, error: '替換表必須包含所有 26 個字母' };
        }
        break;
    }
    
    return { isValid: true };
  }

  /**
   * 生成 Playfair 矩陣
   * @param key Playfair 密鑰
   * @returns 5x5 的 Playfair 矩陣
   */
  static generatePlayfairMatrix(key: string): string[][] {
    const matrix: string[][] = Array(5).fill(null).map(() => Array(5).fill(''));
    const used = new Set<string>();
    let row = 0, col = 0;
    
    // 處理密鑰
    for (const char of key.toUpperCase().replace(/J/g, 'I')) {
      if (!used.has(char) && char.match(/[A-Z]/)) {
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
    for (let c = 65; c <= 90; c++) {
      const char = String.fromCharCode(c);
      if (char !== 'J' && !used.has(char)) {
        matrix[row][col] = char;
        col++;
        if (col === 5) {
          col = 0;
          row++;
        }
      }
    }
    
    return matrix;
  }

  /**
   * 檢查兩個數是否互質
   * @param a 第一個數
   * @param b 第二個數
   * @returns 是否互質
   */
  private static isCoprime(a: number, b: number): boolean {
    const gcd = (x: number, y: number): number => {
      while (y !== 0) {
        const temp = y;
        y = x % y;
        x = temp;
      }
      return x;
    };
    return gcd(a, b) === 1;
  }

  /**
   * 生成隨機密鑰
   * @param method 解密方法
   * @returns 隨機生成的密鑰
   */
  static generateRandomKey(method: string): DecoderOptions {
    switch (method) {
      case 'vigenere':
        return {
          key: Array(8).fill(null)
            .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
            .join('')
        };
      
      case 'playfair':
        return {
          playfairKey: Array(10).fill(null)
            .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
            .join('')
        };
      
      case 'railfence':
        return {
          rails: Math.floor(Math.random() * 19) + 2 // 2-20
        };
      
      case 'affine':
        const coprimes = [1, 3, 5, 7, 11, 17, 19, 23, 25];
        return {
          a: coprimes[Math.floor(Math.random() * coprimes.length)],
          b: Math.floor(Math.random() * 26)
        };
      
      case 'substitution':
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
        const map: { [key: string]: string } = {};
        alphabet.forEach((char, i) => {
          map[char] = shuffled[i];
        });
        return { substitutionMap: map };
      
      default:
        return {};
    }
  }

  /**
   * 格式化密鑰顯示
   * @param method 解密方法
   * @param options 解密選項
   * @returns 格式化後的密鑰字符串
   */
  static formatKeyDisplay(method: string, options: DecoderOptions): string {
    switch (method) {
      case 'vigenere':
        return `密鑰: ${options.key}`;
      
      case 'playfair':
        const matrix = this.generatePlayfairMatrix(options.playfairKey || '');
        return `密鑰: ${options.playfairKey}\n矩陣:\n${matrix.map(row => row.join(' ')).join('\n')}`;
      
      case 'railfence':
        return `柵欄層數: ${options.rails}`;
      
      case 'affine':
        return `a = ${options.a}, b = ${options.b}`;
      
      case 'substitution':
        const map = options.substitutionMap || {};
        return `替換表:\n${Object.entries(map).map(([k, v]) => `${k} → ${v}`).join('\n')}`;
      
      default:
        return '';
    }
  }
} 