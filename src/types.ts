export type DecodeMethod = 
  // 基礎編碼
  | 'base64'
  | 'base32'
  | 'base58'
  | 'base85'
  | 'hex'
  | 'binary'
  | 'ascii'
  | 'decimal'
  | 'url'
  | 'unicode'
  | 'utf8'
  | 'base64image'  // Base64 圖片解碼
  
  // 替換密碼
  | 'caesar'      // 凱薩密碼
  | 'rot13'       // ROT13
  | 'atbash'      // Atbash
  | 'vigenere'    // 維吉尼亞密碼
  | 'substitution' // 單表替換
  | 'affine'      // 仿射密碼
  | 'pigpen'      // 豬圈密碼
  | 'railfence'   // 柵欄密碼
  | 'playfair'    // Playfair 密碼
  
  // 古典密碼
  | 'morse'       // 摩斯密碼
  | 'bacon'       // 培根密碼
  | 'polybius'    // 波利比奧斯方陣
  | 'tap'         // 敲擊碼
  
  // 現代密碼
  | 'md5'         // MD5 雜湊
  | 'sha1'        // SHA1 雜湊
  | 'sha256'      // SHA256 雜湊
  | 'sha512'      // SHA512 雜湊
  | 'jwt'         // JWT 解碼
  
  // 特殊編碼
  | 'brainfuck'   // Brainfuck
  | 'jsfuck'      // JSFuck
  | 'aaencode'    // AAencode
  | 'jother'      // Jother
  | 'ook'         // Ook!
  | 'uuencode'    // UUencode
  | 'xxencode'    // XXencode
  | 'base91'      // Base91
  
  // 隱寫術
  | 'whitespace'  // 空白字符隱寫
  | 'zero-width'  // 零寬字符
  | 'stegano'     // 圖片隱寫
  | 'audio-steg'  // 音頻隱寫
  
  // 其他
  | 'reverse'     // 字符串反轉
  | 'qwerty'      // QWERTY 鍵盤密碼
  | 'keyboard'    // 鍵盤密碼
  | 'phonetic'    // 音標密碼
  | 'dna'         // DNA 密碼
  | 'hex-color';  // 顏色代碼

export type OperationType = 'encode' | 'decode';

export interface DecodeResult {
  method: DecodeMethod;
  result: string;
  status: 'success' | 'error';
  additionalInfo?: {
    type?: string;
    data?: any;
    preview?: string;
  };
}

export interface DecoderOptions {
  // 通用選項
  key?: string;
  shift?: number;
  rails?: number;
  alphabet?: string;
  
  // 仿射密碼選項
  a?: number;
  b?: number;
  
  // 維吉尼亞密碼選項
  keyword?: string;
  
  // 替換密碼選項
  substitutionMap?: { [key: string]: string };
  
  // 圖片相關選項
  imageFormat?: 'png' | 'jpg' | 'gif';
  imageWidth?: number;
  imageHeight?: number;
  
  // 隱寫術選項
  steganoMethod?: 'lsb' | 'metadata' | 'eog';
  bitsPerChannel?: number;
  
  // 雜湊選項
  hashFormat?: 'hex' | 'base64';
  salt?: string;
  
  // 其他選項
  encoding?: string;
  format?: string;
  variant?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
} 