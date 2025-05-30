// Base32 編碼表
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Base58 編碼表 (Bitcoin)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Base85 編碼表 (ASCII85)
const BASE85_ALPHABET = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu';

// Base91 編碼表
const BASE91_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';

// DNA 編碼表
const DNA_ENCODINGS: { [key: string]: { [key: string]: string } } = {
  '1': { '00': 'A', '01': 'C', '10': 'G', '11': 'T' },
  '2': { '01': 'A', '10': 'C', '11': 'G', '00': 'T' },
  '3': { '11': 'A', '00': 'C', '01': 'G', '10': 'T' }
};

// Base32 編碼
export function encodeBase32(input: string, padding = true): string {
  const bytes = new TextEncoder().encode(input);
  let bits = '';
  let output = '';

  // 將字節轉換為二進制字符串
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0');
  }

  // 每 5 位轉換為一個 Base32 字符
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    output += BASE32_ALPHABET[parseInt(chunk, 2)];
  }

  // 添加填充
  if (padding) {
    const padLength = [0, 6, 4, 3, 1][output.length % 8];
    output += '='.repeat(padLength);
  }

  return output;
}

// Base32 解碼
export function decodeBase32(input: string): string {
  // 移除填充
  input = input.replace(/=+$/, '');

  let bits = '';
  for (const char of input.toUpperCase()) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error('無效的 Base32 編碼');
    bits += index.toString(2).padStart(5, '0');
  }

  // 將二進制字符串轉換為字節數組
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }

  return new TextDecoder().decode(bytes);
}

// Base58 編碼
export function encodeBase58(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let num = BigInt(0);
  
  // 將字節數組轉換為大整數
  for (const byte of bytes) {
    num = num * BigInt(256) + BigInt(byte);
  }

  let output = '';
  while (num > 0) {
    const index = Number(num % BigInt(58));
    output = BASE58_ALPHABET[index] + output;
    num = num / BigInt(58);
  }

  // 處理前導零
  for (const byte of bytes) {
    if (byte === 0) output = '1' + output;
    else break;
  }

  return output;
}

// Base58 解碼
export function decodeBase58(input: string): string {
  let num = BigInt(0);
  
  // 將 Base58 字符串轉換為大整數
  for (const char of input) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) throw new Error('無效的 Base58 編碼');
    num = num * BigInt(58) + BigInt(index);
  }

  // 轉換為字節數組
  const bytes: number[] = [];
  while (num > 0) {
    bytes.unshift(Number(num % BigInt(256)));
    num = num / BigInt(256);
  }

  // 處理前導 1
  for (const char of input) {
    if (char === '1') bytes.unshift(0);
    else break;
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

// Base85 編碼
export function encodeBase85(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let output = '';

  // 每 4 字節處理一組
  for (let i = 0; i < bytes.length; i += 4) {
    let value = 0;
    for (let j = 0; j < 4; j++) {
      if (i + j < bytes.length) {
        value = (value << 8) + bytes[i + j];
      }
    }

    // 轉換為 5 個 Base85 字符
    for (let j = 4; j >= 0; j--) {
      output += BASE85_ALPHABET[Math.floor(value / Math.pow(85, j)) % 85];
    }
  }

  return output;
}

// Base85 解碼
export function decodeBase85(input: string): string {
  const bytes: number[] = [];
  
  // 每 5 個字符處理一組
  for (let i = 0; i < input.length; i += 5) {
    let value = 0;
    for (let j = 0; j < 5; j++) {
      if (i + j < input.length) {
        const index = BASE85_ALPHABET.indexOf(input[i + j]);
        if (index === -1) throw new Error('無效的 Base85 編碼');
        value = value * 85 + index;
      }
    }

    // 轉換為 4 個字節
    for (let j = 3; j >= 0; j--) {
      bytes.push((value >> (j * 8)) & 0xFF);
    }
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

// Base91 編碼
export function encodeBase91(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let output = '';
  let queue = 0;
  let nbits = 0;

  for (const byte of bytes) {
    queue |= byte << nbits;
    nbits += 8;
    if (nbits > 13) {
      let val = queue & 8191;
      if (val > 88) {
        queue >>= 13;
        nbits -= 13;
      } else {
        val = queue & 16383;
        queue >>= 14;
        nbits -= 14;
      }
      output += BASE91_ALPHABET[val % 91] + BASE91_ALPHABET[Math.floor(val / 91)];
    }
  }

  if (nbits) {
    output += BASE91_ALPHABET[queue % 91];
    if (nbits > 7 || queue > 90) {
      output += BASE91_ALPHABET[Math.floor(queue / 91)];
    }
  }

  return output;
}

// Base91 解碼
export function decodeBase91(input: string): string {
  const bytes: number[] = [];
  let queue = 0;
  let nbits = 0;
  let val = -1;

  for (const char of input) {
    const index = BASE91_ALPHABET.indexOf(char);
    if (index === -1) throw new Error('無效的 Base91 編碼');
    
    if (val === -1) {
      val = index;
    } else {
      val += index * 91;
      queue |= val << nbits;
      nbits += (val & 8191) > 88 ? 13 : 14;
      
      do {
        bytes.push(queue & 0xFF);
        queue >>= 8;
        nbits -= 8;
      } while (nbits > 7);
      
      val = -1;
    }
  }

  if (val !== -1) {
    bytes.push((queue | (val << nbits)) & 0xFF);
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

// DNA 編碼
export function encodeDNA(input: string, encoding = '1'): string {
  const bytes = new TextEncoder().encode(input);
  let bits = '';
  let output = '';

  // 將字節轉換為二進制字符串
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0');
  }

  // 每 2 位轉換為一個 DNA 字母
  for (let i = 0; i < bits.length; i += 2) {
    const chunk = bits.slice(i, i + 2);
    output += DNA_ENCODINGS[encoding][chunk];
  }

  return output;
}

// DNA 解碼
export function decodeDNA(input: string, encoding = '1'): string {
  // 創建反向映射
  const reverseMap: { [key: string]: string } = {};
  for (const [bits, dna] of Object.entries(DNA_ENCODINGS[encoding])) {
    reverseMap[dna] = bits;
  }

  let bits = '';
  for (const char of input.toUpperCase()) {
    if (!reverseMap[char]) throw new Error('無效的 DNA 編碼');
    bits += reverseMap[char];
  }

  // 將二進制字符串轉換為字節數組
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }

  return new TextDecoder().decode(bytes);
}

// 顏色編碼
export function encodeHexColor(input: string, format = 'hex'): string {
  const bytes = new TextEncoder().encode(input);
  let output = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const r = bytes[i] || 0;
    const g = bytes[i + 1] || 0;
    const b = bytes[i + 2] || 0;

    switch (format) {
      case 'hex':
        output += `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')} `;
        break;
      case 'rgb':
        output += `rgb(${r},${g},${b}) `;
        break;
      case 'hsl':
        const [h, s, l] = rgbToHsl(r, g, b);
        output += `hsl(${Math.round(h)},${Math.round(s)}%,${Math.round(l)}%) `;
        break;
    }
  }

  return output.trim();
}

// 顏色解碼
export function decodeHexColor(input: string): string {
  const bytes = [];
  const colors = input.trim().split(/\s+/);

  for (const color of colors) {
    let r: number, g: number, b: number;

    if (color.startsWith('#')) {
      // 十六進制格式
      const hex = color.slice(1);
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else if (color.startsWith('rgb')) {
      // RGB 格式
      const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
      if (!match) throw new Error('無效的 RGB 顏色格式');
      [, r, g, b] = match.map(Number);
    } else if (color.startsWith('hsl')) {
      // HSL 格式
      const match = color.match(/hsl\((\d+),(\d+)%,(\d+)%\)/);
      if (!match) throw new Error('無效的 HSL 顏色格式');
      const [h, s, l] = match.slice(1).map(Number);
      [r, g, b] = hslToRgb(h, s, l);
    } else {
      throw new Error('無效的顏色格式');
    }

    bytes.push(r, g, b);
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

// RGB 轉 HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
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
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

// HSL 轉 RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ];
} 