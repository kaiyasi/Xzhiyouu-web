import { EncoderMetrics } from '../types';

class MetricsCollector {
  private metrics: Map<string, EncoderMetrics[]>;
  private maxSamples: number;

  constructor(maxSamples: number = 100) {
    this.metrics = new Map();
    this.maxSamples = maxSamples;
  }

  /**
   * 記錄編碼操作的性能指標
   * @param method 編碼方法
   * @param metrics 性能指標
   */
  record(method: string, metrics: EncoderMetrics): void {
    if (!this.metrics.has(method)) {
      this.metrics.set(method, []);
    }

    const samples = this.metrics.get(method)!;
    samples.push(metrics);

    // 保持樣本數量在限制內
    if (samples.length > this.maxSamples) {
      samples.shift();
    }
  }

  /**
   * 獲取指定方法的平均性能指標
   * @param method 編碼方法
   * @returns 平均性能指標
   */
  getAverageMetrics(method: string): Partial<EncoderMetrics> | null {
    const samples = this.metrics.get(method);
    if (!samples || samples.length === 0) {
      return null;
    }

    const sum = samples.reduce((acc, curr) => ({
      encodeTime: acc.encodeTime + curr.encodeTime,
      decodeTime: acc.decodeTime + curr.decodeTime,
      inputSize: acc.inputSize + curr.inputSize,
      outputSize: acc.outputSize + curr.outputSize,
      timestamp: 0
    }));

    return {
      encodeTime: sum.encodeTime / samples.length,
      decodeTime: sum.decodeTime / samples.length,
      inputSize: sum.inputSize / samples.length,
      outputSize: sum.outputSize / samples.length
    };
  }

  /**
   * 獲取指定方法的性能趨勢
   * @param method 編碼方法
   * @param metric 指標名稱
   * @param samples 樣本數量
   * @returns 性能趨勢數據
   */
  getTrend(method: string, metric: keyof EncoderMetrics, samples: number = 10): number[] {
    const data = this.metrics.get(method);
    if (!data) return [];

    return data
      .slice(-samples)
      .map(m => m[metric])
      .filter((value): value is number => typeof value === 'number');
  }

  /**
   * 獲取所有方法的性能統計
   * @returns 性能統計數據
   */
  getStats(): Record<string, {
    samples: number;
    averageEncodeTime: number;
    averageDecodeTime: number;
    averageInputSize: number;
    averageOutputSize: number;
  }> {
    const stats: Record<string, any> = {};

    for (const [method, samples] of this.metrics.entries()) {
      const averageMetrics = this.getAverageMetrics(method);
      if (averageMetrics) {
        stats[method] = {
          samples: samples.length,
          ...averageMetrics
        };
      }
    }

    return stats;
  }

  /**
   * 清除所有性能指標數據
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * 清除指定方法的性能指標數據
   * @param method 編碼方法
   */
  clearMethod(method: string): void {
    this.metrics.delete(method);
  }
}

// 創建全局實例
export const metricsCollector = new MetricsCollector();

/**
 * 性能監控裝飾器
 * @param method 編碼方法
 */
export function measurePerformance(method: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const end = performance.now();

      const metrics: EncoderMetrics = {
        encodeTime: propertyKey.includes('encode') ? end - start : 0,
        decodeTime: propertyKey.includes('decode') ? end - start : 0,
        inputSize: args[0]?.length || 0,
        outputSize: result?.length || 0,
        timestamp: Date.now()
      };

      metricsCollector.record(method, metrics);

      return result;
    };

    return descriptor;
  };
} 