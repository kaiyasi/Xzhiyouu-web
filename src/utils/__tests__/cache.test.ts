import { describe, expect, test, jest } from '@jest/globals';
import { LRUCache } from '../cache';
import { CacheConfig } from '../../types';

describe('LRU 緩存', () => {
  const defaultConfig: CacheConfig = {
    enabled: true,
    maxSize: 100,
    ttl: 1000 // 1 秒
  };

  test('應該正確存儲和檢索值', () => {
    const cache = new LRUCache<string>(defaultConfig);
    cache.set('test', 'input', 'value');
    expect(cache.get('test', 'input')).toBe('value');
  });

  test('應該處理不同的選項', () => {
    const cache = new LRUCache<string>(defaultConfig);
    const options = { format: 'hex' };
    cache.set('test', 'input', 'value', options);
    expect(cache.get('test', 'input', options)).toBe('value');
    expect(cache.get('test', 'input', { format: 'rgb' })).toBeUndefined();
  });

  test('應該遵守大小限制', () => {
    const cache = new LRUCache<string>({ ...defaultConfig, maxSize: 2 });
    cache.set('test1', 'input1', 'value1');
    cache.set('test2', 'input2', 'value2');
    cache.set('test3', 'input3', 'value3');
    expect(cache.size).toBe(2);
    expect(cache.get('test1', 'input1')).toBeUndefined();
  });

  test('應該處理過期項目', () => {
    jest.useFakeTimers();
    const cache = new LRUCache<string>({ ...defaultConfig, ttl: 1000 });
    cache.set('test', 'input', 'value');
    
    // 前進 2 秒
    jest.advanceTimersByTime(2000);
    expect(cache.get('test', 'input')).toBeUndefined();
    jest.useRealTimers();
  });

  test('禁用時應該不緩存', () => {
    const cache = new LRUCache<string>({ ...defaultConfig, enabled: false });
    cache.set('test', 'input', 'value');
    expect(cache.get('test', 'input')).toBeUndefined();
  });

  test('應該正確清除緩存', () => {
    const cache = new LRUCache<string>(defaultConfig);
    cache.set('test1', 'input1', 'value1');
    cache.set('test2', 'input2', 'value2');
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get('test1', 'input1')).toBeUndefined();
    expect(cache.get('test2', 'input2')).toBeUndefined();
  });

  test('應該處理複雜的選項對象', () => {
    const cache = new LRUCache<string>(defaultConfig);
    const options = {
      format: 'hex',
      padding: true,
      nested: { key: 'value' }
    };
    cache.set('test', 'input', 'value', options);
    expect(cache.get('test', 'input', { ...options })).toBe('value');
    expect(cache.get('test', 'input', { ...options, padding: false })).toBeUndefined();
  });
}); 