export type DecodeMethod =
  | 'base32'
  | 'base58'
  | 'base85'
  | 'base91'
  | 'brainfuck'
  | 'jsfuck'
  | 'aaencode'
  | 'whitespace'
  | 'zero-width'
  | 'uuencode'
  | 'xxencode'
  | 'tap'
  | 'phonetic'
  | 'dna';

export interface DecoderOptions {
  // Base32/58/85/91 選項
  padding?: boolean;

  // Brainfuck 選項
  memorySize?: number;

  // Whitespace 選項
  type?: 'space-tab' | 'space' | 'tab';

  // Zero-width 選項
  zwType?: 'zwsp-zwnj' | 'zwsp' | 'zwnj';

  // UUencode/XXencode 選項
  filename?: string;

  // Tap 碼選項
  format?: 'dots' | 'numbers';

  // Phonetic 碼選項
  separator?: string;
  upperCase?: boolean;

  // DNA 編碼選項
  encoding?: '1' | '2' | '3';
}

export interface EncoderResult {
  success: boolean;
  result?: string;
  error?: string;
}

// 緩存配置接口
export interface CacheConfig {
  enabled: boolean;
  maxSize: number;
  ttl: number; // 過期時間（毫秒）
}

// 編碼器性能指標接口
export interface EncoderMetrics {
  encodeTime: number;
  decodeTime: number;
  inputSize: number;
  outputSize: number;
  timestamp: number;
} 