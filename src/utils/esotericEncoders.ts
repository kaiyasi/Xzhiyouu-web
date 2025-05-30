// Brainfuck 編碼器
export function encodeBrainfuck(input: string, memorySize = 30000): string {
  const bytes = new TextEncoder().encode(input);
  let output = '';
  let memory = new Uint8Array(memorySize);
  let pointer = 0;
  let currentValue = 0;

  for (const byte of bytes) {
    // 移動指針到最近的位置
    while (currentValue < byte) {
      output += '+';
      currentValue++;
    }
    while (currentValue > byte) {
      output += '-';
      currentValue--;
    }
    output += '.';
  }

  return output;
}

export function decodeBrainfuck(input: string, memorySize = 30000): string {
  const memory = new Uint8Array(memorySize);
  let pointer = 0;
  let output = '';
  let i = 0;

  while (i < input.length) {
    switch (input[i]) {
      case '>': pointer = (pointer + 1) % memorySize; break;
      case '<': pointer = (pointer - 1 + memorySize) % memorySize; break;
      case '+': memory[pointer] = (memory[pointer] + 1) % 256; break;
      case '-': memory[pointer] = (memory[pointer] - 1 + 256) % 256; break;
      case '.': output += String.fromCharCode(memory[pointer]); break;
      case ',': break; // 忽略輸入
      case '[':
        if (memory[pointer] === 0) {
          let depth = 1;
          while (depth > 0) {
            i++;
            if (input[i] === '[') depth++;
            if (input[i] === ']') depth--;
          }
        }
        break;
      case ']':
        if (memory[pointer] !== 0) {
          let depth = 1;
          while (depth > 0) {
            i--;
            if (input[i] === '[') depth--;
            if (input[i] === ']') depth++;
          }
          i--;
        }
        break;
    }
    i++;
  }

  return output;
}

// JSFuck 編碼器
const JSF_CHARS = {
  'false':      '![]',
  'true':       '!![]',
  'undefined':  '[][[]]',
  'NaN':        '+[![]]',
  'Infinity':   '+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+[]]+[+[]]+[+[]])',
  'array':      '[]',
  'number':     '+[]',
  'string':     '[]+[]',
  'boolean':    '![]',
  'function':   '[]["filter"]',
};

export function encodeJSFuck(input: string): string {
  let output = '';
  
  for (const char of input) {
    const code = char.charCodeAt(0);
    output += `[][${JSF_CHARS['filter']}][${JSF_CHARS['constructor']}](${JSF_CHARS['return']}${code})()`;
  }

  return output;
}

export function decodeJSFuck(input: string): string {
  // JSFuck 解碼需要執行 JavaScript，這裡僅返回原始代碼
  return input;
}

// AAencode 編碼器
export function encodeAAencode(input: string): string {
  let output = 'ﾟωﾟﾉ= /｀ｍ´）ﾉ ~┻━┻   //*´∇｀*/ [\'_\']; o=(ﾟｰﾟ)  =_=3; c=(ﾟΘﾟ) =(ﾟｰﾟ)-(ﾟｰﾟ); ';
  
  for (const char of input) {
    const code = char.charCodeAt(0);
    output += `(ﾟДﾟ)[ﾟεﾟ]=${code};`;
  }
  
  output += 'ﾟωﾟﾉ';
  return output;
}

export function decodeAAencode(input: string): string {
  // AAencode 解碼需要執行 JavaScript，這裡僅返回原始代碼
  return input;
}

// Whitespace 編碼器
export function encodeWhitespace(input: string, type = 'space-tab'): string {
  const bytes = new TextEncoder().encode(input);
  let output = '';

  for (const byte of bytes) {
    const binary = byte.toString(2).padStart(8, '0');
    for (const bit of binary) {
      switch (type) {
        case 'space-tab':
          output += bit === '0' ? ' ' : '\t';
          break;
        case 'space':
          output += bit === '0' ? ' ' : '  ';
          break;
        case 'tab':
          output += bit === '0' ? '\t' : '\t\t';
          break;
      }
    }
    output += '\n';
  }

  return output;
}

export function decodeWhitespace(input: string, type = 'space-tab'): string {
  const lines = input.split('\n');
  let bits = '';

  for (const line of lines) {
    if (!line.trim()) continue;

    for (let i = 0; i < line.length; i++) {
      switch (type) {
        case 'space-tab':
          bits += line[i] === ' ' ? '0' : '1';
          break;
        case 'space':
          if (line[i] === ' ') {
            if (line[i + 1] === ' ') {
              bits += '1';
              i++;
            } else {
              bits += '0';
            }
          }
          break;
        case 'tab':
          if (line[i] === '\t') {
            if (line[i + 1] === '\t') {
              bits += '1';
              i++;
            } else {
              bits += '0';
            }
          }
          break;
      }
    }
  }

  // 將二進制字符串轉換為字節數組
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }

  return new TextDecoder().decode(bytes);
}

// Zero-width 編碼器
const ZW_CHARS = {
  'zwsp-zwnj': {
    '0': '\u200B', // ZERO WIDTH SPACE
    '1': '\u200C'  // ZERO WIDTH NON-JOINER
  },
  'zwsp': {
    '0': '\u200B', // ZERO WIDTH SPACE
    '1': '\u200B\u200B'
  },
  'zwnj': {
    '0': '\u200C', // ZERO WIDTH NON-JOINER
    '1': '\u200C\u200C'
  }
};

export function encodeZeroWidth(input: string, type = 'zwsp-zwnj'): string {
  const bytes = new TextEncoder().encode(input);
  let output = '';

  for (const byte of bytes) {
    const binary = byte.toString(2).padStart(8, '0');
    for (const bit of binary) {
      output += ZW_CHARS[type][bit];
    }
  }

  return output;
}

export function decodeZeroWidth(input: string, type = 'zwsp-zwnj'): string {
  let bits = '';
  const chars = ZW_CHARS[type];

  for (let i = 0; i < input.length;) {
    if (input.slice(i, i + 2) === chars['1']) {
      bits += '1';
      i += 2;
    } else if (input[i] === chars['0']) {
      bits += '0';
      i++;
    } else {
      i++;
    }
  }

  // 將二進制字符串轉換為字節數組
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }

  return new TextDecoder().decode(bytes);
}

// UUencode 編碼器
export function encodeUUencode(input: string, filename = ''): string {
  const bytes = new TextEncoder().encode(input);
  let output = `begin 644 ${filename || 'file'}\n`;

  for (let i = 0; i < bytes.length; i += 45) {
    const chunk = bytes.slice(i, i + 45);
    const length = String.fromCharCode(32 + chunk.length);
    output += length;

    for (let j = 0; j < chunk.length; j += 3) {
      const b1 = chunk[j];
      const b2 = j + 1 < chunk.length ? chunk[j + 1] : 0;
      const b3 = j + 2 < chunk.length ? chunk[j + 2] : 0;

      const c1 = String.fromCharCode(32 + ((b1 >> 2) & 0x3F));
      const c2 = String.fromCharCode(32 + (((b1 << 4) | (b2 >> 4)) & 0x3F));
      const c3 = String.fromCharCode(32 + (((b2 << 2) | (b3 >> 6)) & 0x3F));
      const c4 = String.fromCharCode(32 + (b3 & 0x3F));

      output += c1 + c2 + c3 + c4;
    }
    output += '\n';
  }

  output += '`\nend\n';
  return output;
}

export function decodeUUencode(input: string): string {
  const lines = input.split('\n');
  const bytes: number[] = [];

  for (let i = 1; i < lines.length - 2; i++) {
    const line = lines[i];
    if (line === '`') break;

    const length = line.charCodeAt(0) - 32;
    for (let j = 1; j < line.length; j += 4) {
      const c1 = (line.charCodeAt(j) - 32) & 0x3F;
      const c2 = (line.charCodeAt(j + 1) - 32) & 0x3F;
      const c3 = (line.charCodeAt(j + 2) - 32) & 0x3F;
      const c4 = (line.charCodeAt(j + 3) - 32) & 0x3F;

      bytes.push((c1 << 2) | (c2 >> 4));
      if (bytes.length < length) bytes.push(((c2 & 0xF) << 4) | (c3 >> 2));
      if (bytes.length < length) bytes.push(((c3 & 0x3) << 6) | c4);
    }
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

// XXencode 編碼器
const XX_ALPHABET = '+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function encodeXXencode(input: string, filename = ''): string {
  const bytes = new TextEncoder().encode(input);
  let output = `begin 644 ${filename || 'file'}\n`;

  for (let i = 0; i < bytes.length; i += 45) {
    const chunk = bytes.slice(i, i + 45);
    const length = XX_ALPHABET[chunk.length];
    output += length;

    for (let j = 0; j < chunk.length; j += 3) {
      const b1 = chunk[j];
      const b2 = j + 1 < chunk.length ? chunk[j + 1] : 0;
      const b3 = j + 2 < chunk.length ? chunk[j + 2] : 0;

      const c1 = XX_ALPHABET[(b1 >> 2) & 0x3F];
      const c2 = XX_ALPHABET[((b1 << 4) | (b2 >> 4)) & 0x3F];
      const c3 = XX_ALPHABET[((b2 << 2) | (b3 >> 6)) & 0x3F];
      const c4 = XX_ALPHABET[b3 & 0x3F];

      output += c1 + c2 + c3 + c4;
    }
    output += '\n';
  }

  output += '+\nend\n';
  return output;
}

export function decodeXXencode(input: string): string {
  const lines = input.split('\n');
  const bytes: number[] = [];

  for (let i = 1; i < lines.length - 2; i++) {
    const line = lines[i];
    if (line === '+') break;

    const length = XX_ALPHABET.indexOf(line[0]);
    for (let j = 1; j < line.length; j += 4) {
      const c1 = XX_ALPHABET.indexOf(line[j]);
      const c2 = XX_ALPHABET.indexOf(line[j + 1]);
      const c3 = XX_ALPHABET.indexOf(line[j + 2]);
      const c4 = XX_ALPHABET.indexOf(line[j + 3]);

      bytes.push((c1 << 2) | (c2 >> 4));
      if (bytes.length < length) bytes.push(((c2 & 0xF) << 4) | (c3 >> 2));
      if (bytes.length < length) bytes.push(((c3 & 0x3) << 6) | c4);
    }
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
} 