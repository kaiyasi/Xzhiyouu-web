import { CacheConfig } from '../types';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.config = config;
  }

  /**
   * 生成緩存鍵
   * @param method 編碼方法
   * @param input 輸入字符串
   * @param options 選項
   * @returns 緩存鍵
   */
  private generateKey(method: string, input: string, options?: any): string {
    return `${method}:${input}:${JSON.stringify(options)}`;
  }

  /**
   * 清理過期和超出大小限制的緩存
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // 清理過期項目
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > this.config.ttl) {
        this.cache.delete(key);
      }
    });

    // 如果仍然超出大小限制，刪除最舊的項目
    if (this.cache.size > this.config.maxSize) {
      const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const deleteCount = this.cache.size - this.config.maxSize;
      sortedEntries.slice(0, deleteCount).forEach(([key]) => {
        this.cache.delete(key);
      });
    }
  }

  /**
   * 獲取緩存項
   * @param method 編碼方法
   * @param input 輸入字符串
   * @param options 選項
   * @returns 緩存值或 undefined
   */
  get(method: string, input: string, options?: any): T | undefined {
    if (!this.config.enabled) return undefined;

    const key = this.generateKey(method, input, options);
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    // 檢查是否過期
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * 設置緩存項
   * @param method 編碼方法
   * @param input 輸入字符串
   * @param value 要緩存的值
   * @param options 選項
   */
  set(method: string, input: string, value: T, options?: any): void {
    if (!this.config.enabled) return;

    const key = this.generateKey(method, input, options);
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });

    if (this.cache.size > this.config.maxSize) {
      this.cleanup();
    }
  }

  /**
   * 清除所有緩存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 獲取緩存大小
   */
  get size(): number {
    return this.cache.size;
  }
} 