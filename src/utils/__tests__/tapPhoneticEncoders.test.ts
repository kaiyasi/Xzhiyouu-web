import { describe, expect, test } from '@jest/globals';
import {
  encodeTap,
  decodeTap,
  encodePhonetic,
  decodePhonetic
} from '../tapPhoneticEncoders';
import { EncoderError, EncoderErrorType } from '../errors';

describe('Tap 碼編碼器', () => {
  const testCases = [
    ['HELLO', '.... . / .... .... / .... .... / .... .... / .... ....'],
    ['SOS', '..... ... / .... .... / ..... ...'],
    ['123', '. .. / . ... / . ....'],
    ['A B C', '. . / / . .. / / . ...'],
    ['HI!', '.... .... / .... ..... / ........ .....']
  ];

  test.each(testCases)('應該正確編碼: %s', (input, expected) => {
    expect(encodeTap(input)).toBe(expected);
  });

  test.each(testCases)('應該正確解碼: %s', (expected, input) => {
    expect(decodeTap(input)).toBe(expected);
  });

  test('應該處理無效輸入', () => {
    expect(() => encodeTap('你好')).toThrow(EncoderError);
    expect(() => encodeTap('')).toThrow(EncoderError);
    expect(() => decodeTap('... .. .')).toThrow(EncoderError);
  });

  test('應該驗證 Tap 碼格式', () => {
    expect(() => decodeTap('...... .')).toThrow(EncoderError);
    expect(() => decodeTap('. . .')).toThrow(EncoderError);
  });
});

describe('Phonetic 碼編碼器', () => {
  const testCases = [
    ['HELLO', 'Hotel Echo Lima Lima Oscar'],
    ['SOS', 'Sierra Oscar Sierra'],
    ['123', 'One Two Three'],
    ['A B C', 'Alpha / Bravo / Charlie'],
    ['HI!', 'Hotel India Bang']
  ];

  test.each(testCases)('應該正確編碼: %s', (input, expected) => {
    expect(encodePhonetic(input)).toBe(expected);
  });

  test.each(testCases)('應該正確解碼: %s', (expected, input) => {
    expect(decodePhonetic(input)).toBe(expected);
  });

  test('應該處理大小寫', () => {
    expect(encodePhonetic('hello')).toBe('Hotel Echo Lima Lima Oscar');
    expect(decodePhonetic('hotel ECHO lima')).toBe('HEL');
  });

  test('應該處理無效輸入', () => {
    expect(() => encodePhonetic('你好')).toThrow(EncoderError);
    expect(() => encodePhonetic('')).toThrow(EncoderError);
    expect(() => decodePhonetic('Invalid Code')).toThrow(EncoderError);
  });

  test('應該正確處理標點符號', () => {
    expect(encodePhonetic('A.B,C?!')).toBe('Alpha Stop Bravo Comma Charlie Query Bang');
    expect(decodePhonetic('Alpha Stop Bravo Comma Charlie Query Bang')).toBe('A.B,C?!');
  });
}); 