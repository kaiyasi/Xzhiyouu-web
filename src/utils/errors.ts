// 定義錯誤類型
export enum EncoderErrorType {
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_ENCODING = 'INVALID_ENCODING',
  INVALID_PADDING = 'INVALID_PADDING',
  INVALID_CHARACTER = 'INVALID_CHARACTER',
  MEMORY_OVERFLOW = 'MEMORY_OVERFLOW',
  INVALID_FORMAT = 'INVALID_FORMAT',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
}

// 基礎編碼器錯誤
export class EncoderError extends Error {
  constructor(
    public type: EncoderErrorType,
    public message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'EncoderError';
  }
}

// 特定編碼器錯誤
export class Base32Error extends EncoderError {
  constructor(message: string, originalError?: Error) {
    super(EncoderErrorType.INVALID_CHARACTER, message, originalError);
    this.name = 'Base32Error';
  }
}

export class Base58Error extends EncoderError {
  constructor(message: string, originalError?: Error) {
    super(EncoderErrorType.INVALID_CHARACTER, message, originalError);
    this.name = 'Base58Error';
  }
}

export class Base85Error extends EncoderError {
  constructor(message: string, originalError?: Error) {
    super(EncoderErrorType.INVALID_CHARACTER, message, originalError);
    this.name = 'Base85Error';
  }
}

export class Base91Error extends EncoderError {
  constructor(message: string, originalError?: Error) {
    super(EncoderErrorType.INVALID_CHARACTER, message, originalError);
    this.name = 'Base91Error';
  }
}

export class BrainfuckError extends EncoderError {
  constructor(message: string, originalError?: Error) {
    super(EncoderErrorType.MEMORY_OVERFLOW, message, originalError);
    this.name = 'BrainfuckError';
  }
}

export class WhitespaceError extends EncoderError {
  constructor(message: string, originalError?: Error) {
    super(EncoderErrorType.INVALID_FORMAT, message, originalError);
    this.name = 'WhitespaceError';
  }
}

export class ZeroWidthError extends EncoderError {
  constructor(message: string, originalError?: Error) {
    super(EncoderErrorType.INVALID_CHARACTER, message, originalError);
    this.name = 'ZeroWidthError';
  }
}

export class UUencodeError extends EncoderError {
  constructor(message: string, originalError?: Error) {
    super(EncoderErrorType.INVALID_FORMAT, message, originalError);
    this.name = 'UUencodeError';
  }
}

export class XXencodeError extends EncoderError {
  constructor(message: string, originalError?: Error) {
    super(EncoderErrorType.INVALID_FORMAT, message, originalError);
    this.name = 'XXencodeError';
  }
}

// 錯誤處理工具函數
export function handleEncodingError(error: unknown, encoderName: string): EncoderError {
  if (error instanceof EncoderError) {
    return error;
  }

  if (error instanceof Error) {
    return new EncoderError(
      EncoderErrorType.INVALID_INPUT,
      `${encoderName} 編碼錯誤: ${error.message}`,
      error
    );
  }

  return new EncoderError(
    EncoderErrorType.INVALID_INPUT,
    `${encoderName} 編碼時發生未知錯誤`,
    error instanceof Error ? error : undefined
  );
}

export function handleDecodingError(error: unknown, encoderName: string): EncoderError {
  if (error instanceof EncoderError) {
    return error;
  }

  if (error instanceof Error) {
    return new EncoderError(
      EncoderErrorType.INVALID_ENCODING,
      `${encoderName} 解碼錯誤: ${error.message}`,
      error
    );
  }

  return new EncoderError(
    EncoderErrorType.INVALID_ENCODING,
    `${encoderName} 解碼時發生未知錯誤`,
    error instanceof Error ? error : undefined
  );
}

// 輸入驗證函數
export function validateInput(input: unknown): string {
  if (input === null || input === undefined) {
    throw new EncoderError(
      EncoderErrorType.INVALID_INPUT,
      '輸入不能為空'
    );
  }

  if (typeof input !== 'string') {
    throw new EncoderError(
      EncoderErrorType.INVALID_INPUT,
      '輸入必須是字符串'
    );
  }

  return input;
}

// 字符集驗證函數
export function validateCharset(input: string, charset: string, encoderName: string): void {
  const invalidChars = [...input].filter(char => !charset.includes(char));
  if (invalidChars.length > 0) {
    throw new EncoderError(
      EncoderErrorType.INVALID_CHARACTER,
      `${encoderName} 包含無效字符: ${invalidChars.join(', ')}`
    );
  }
}

// 記憶體大小驗證函數
export function validateMemorySize(size: number, min: number, max: number): void {
  if (size < min || size > max) {
    throw new EncoderError(
      EncoderErrorType.MEMORY_OVERFLOW,
      `記憶體大小必須在 ${min} 到 ${max} 之間`
    );
  }
}

// 文件名驗證函數
export function validateFilename(filename: string): void {
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    throw new EncoderError(
      EncoderErrorType.INVALID_FORMAT,
      '文件名只能包含字母、數字、點、下劃線和連字符'
    );
  }
} 