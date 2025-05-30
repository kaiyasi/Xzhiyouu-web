import { describe, expect, test } from '@jest/globals';
import {
  encodeBase32,
  decodeBase32,
  encodeBase58,
  decodeBase58,
  encodeBase85,
  decodeBase85,
  encodeBase91,
  decodeBase91,
} from '../encoders';

import {
  encodeBrainfuck,
  decodeBrainfuck,
  encodeWhitespace,
  decodeWhitespace,
  encodeZeroWidth,
  decodeZeroWidth,
  encodeUUencode,
  decodeUUencode,
  encodeXXencode,
  decodeXXencode,
} from '../esotericEncoders';

describe('基本編碼器測試', () => {
  const testCases = [
    'Hello, World!',
    '你好，世界！',
    '1234567890',
    'αβγδεζηθικλμνξο',
    '🌍🌎🌏'
  ];

  describe('Base32', () => {
    test.each(testCases)('應該正確編碼和解碼: %s', (input) => {
      const encoded = encodeBase32(input);
      const decoded = decodeBase32(encoded);
      expect(decoded).toBe(input);
    });

    test('應該處理填充', () => {
      const input = 'test';
      const withPadding = encodeBase32(input, true);
      const withoutPadding = encodeBase32(input, false);
      expect(withPadding).toContain('=');
      expect(withoutPadding).not.toContain('=');
      expect(decodeBase32(withPadding)).toBe(input);
      expect(decodeBase32(withoutPadding)).toBe(input);
    });
  });

  describe('Base58', () => {
    test.each(testCases)('應該正確編碼和解碼: %s', (input) => {
      const encoded = encodeBase58(input);
      const decoded = decodeBase58(encoded);
      expect(decoded).toBe(input);
    });

    test('應該處理前導零', () => {
      const input = '\0test';
      const encoded = encodeBase58(input);
      expect(encoded.startsWith('1')).toBe(true);
      expect(decodeBase58(encoded)).toBe(input);
    });
  });

  describe('Base85', () => {
    test.each(testCases)('應該正確編碼和解碼: %s', (input) => {
      const encoded = encodeBase85(input);
      const decoded = decodeBase85(encoded);
      expect(decoded).toBe(input);
    });
  });

  describe('Base91', () => {
    test.each(testCases)('應該正確編碼和解碼: %s', (input) => {
      const encoded = encodeBase91(input);
      const decoded = decodeBase91(encoded);
      expect(decoded).toBe(input);
    });
  });
});

describe('深奧編碼器測試', () => {
  describe('Brainfuck', () => {
    test('應該正確編碼和解碼簡單文本', () => {
      const input = 'Hello';
      const encoded = encodeBrainfuck(input);
      const decoded = decodeBrainfuck(encoded);
      expect(decoded).toBe(input);
    });

    test('應該處理不同的記憶體大小', () => {
      const input = 'Test';
      const encoded = encodeBrainfuck(input, 1000);
      const decoded = decodeBrainfuck(encoded, 1000);
      expect(decoded).toBe(input);
    });
  });

  describe('Whitespace', () => {
    const input = 'Test';

    test.each([
      'space-tab',
      'space',
      'tab'
    ])('應該使用 %s 模式正確編碼和解碼', (type) => {
      const encoded = encodeWhitespace(input, type);
      const decoded = decodeWhitespace(encoded, type);
      expect(decoded).toBe(input);
    });
  });

  describe('Zero-width', () => {
    const input = 'Test';

    test.each([
      'zwsp-zwnj',
      'zwsp',
      'zwnj'
    ])('應該使用 %s 模式正確編碼和解碼', (type) => {
      const encoded = encodeZeroWidth(input, type);
      const decoded = decodeZeroWidth(encoded, type);
      expect(decoded).toBe(input);
    });

    test('編碼結果應該只包含零寬字符', () => {
      const encoded = encodeZeroWidth('Test');
      expect(encoded).toMatch(/^[\u200B\u200C]*$/);
    });
  });

  describe('UUencode', () => {
    test.each(testCases)('應該正確編碼和解碼: %s', (input) => {
      const encoded = encodeUUencode(input);
      const decoded = decodeUUencode(encoded);
      expect(decoded).toBe(input);
    });

    test('應該支援自定義文件名', () => {
      const input = 'Test';
      const filename = 'test.txt';
      const encoded = encodeUUencode(input, filename);
      expect(encoded).toContain(filename);
      expect(decodeUUencode(encoded)).toBe(input);
    });
  });

  describe('XXencode', () => {
    test.each(testCases)('應該正確編碼和解碼: %s', (input) => {
      const encoded = encodeXXencode(input);
      const decoded = decodeXXencode(encoded);
      expect(decoded).toBe(input);
    });

    test('應該支援自定義文件名', () => {
      const input = 'Test';
      const filename = 'test.txt';
      const encoded = encodeXXencode(input, filename);
      expect(encoded).toContain(filename);
      expect(decodeXXencode(encoded)).toBe(input);
    });

    test('應該只使用有效的 XXencode 字符', () => {
      const input = 'Test';
      const encoded = encodeXXencode(input);
      expect(encoded).toMatch(/^[+-0-9A-Za-z\s]*$/);
    });
  });
}); 