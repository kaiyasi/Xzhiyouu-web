import { describe, expect, test } from '@jest/globals';
import { encodeDNA, decodeDNA } from '../dnaEncoder';
import { EncoderError } from '../errors';

describe('DNA 編碼器', () => {
  const testCases = [
    ['Hello', 'CGACGTTAACTGCGTACG'],
    ['123', 'CGTAGACGTCGT'],
    ['ABC', 'CGACGACGTCGT'],
    ['!@#', 'CGTCGTTACGTA'],
    ['你好', 'CGACGTTAACTGCGTACGTACGTACGT']
  ];

  describe('編碼方式 1', () => {
    test.each(testCases)('應該正確編碼和解碼: %s', (input, expected) => {
      const encoded = encodeDNA(input, '1');
      expect(encoded).toBe(expected);
      expect(decodeDNA(encoded, '1')).toBe(input);
    });
  });

  describe('編碼方式 2', () => {
    test.each(testCases)('應該正確編碼和解碼: %s', (input) => {
      const encoded = encodeDNA(input, '2');
      expect(decodeDNA(encoded, '2')).toBe(input);
    });
  });

  describe('編碼方式 3', () => {
    test.each(testCases)('應該正確編碼和解碼: %s', (input) => {
      const encoded = encodeDNA(input, '3');
      expect(decodeDNA(encoded, '3')).toBe(input);
    });
  });

  test('應該處理無效輸入', () => {
    expect(() => encodeDNA('')).toThrow(EncoderError);
    expect(() => decodeDNA('XYZ')).toThrow(EncoderError);
    expect(() => decodeDNA('ABC')).toThrow(EncoderError);
  });

  test('應該處理大小寫', () => {
    const input = 'Test';
    const encoded = encodeDNA(input, '1');
    expect(decodeDNA(encoded.toLowerCase(), '1')).toBe(input);
    expect(decodeDNA(encoded.toUpperCase(), '1')).toBe(input);
  });

  test('應該驗證 DNA 序列長度', () => {
    const invalidSequence = 'CGACGT'; // 6 個鹼基，無法構成完整的字節
    expect(() => decodeDNA(invalidSequence)).toThrow(EncoderError);
  });
}); 