import { describe, expect, test, jest } from '@jest/globals';
import { metricsCollector, measurePerformance } from '../metrics';
import { EncoderMetrics } from '../../types';

describe('性能監控', () => {
  beforeEach(() => {
    metricsCollector.clear();
  });

  test('應該正確記錄性能指標', () => {
    const metrics: EncoderMetrics = {
      encodeTime: 100,
      decodeTime: 0,
      inputSize: 10,
      outputSize: 20,
      timestamp: Date.now()
    };

    metricsCollector.record('test', metrics);
    const stats = metricsCollector.getStats();
    
    expect(stats.test).toBeDefined();
    expect(stats.test.averageEncodeTime).toBe(100);
    expect(stats.test.averageInputSize).toBe(10);
    expect(stats.test.averageOutputSize).toBe(20);
  });

  test('應該計算平均性能指標', () => {
    const metrics1: EncoderMetrics = {
      encodeTime: 100,
      decodeTime: 50,
      inputSize: 10,
      outputSize: 20,
      timestamp: Date.now()
    };

    const metrics2: EncoderMetrics = {
      encodeTime: 200,
      decodeTime: 150,
      inputSize: 20,
      outputSize: 40,
      timestamp: Date.now()
    };

    metricsCollector.record('test', metrics1);
    metricsCollector.record('test', metrics2);

    const averageMetrics = metricsCollector.getAverageMetrics('test');
    expect(averageMetrics).toEqual({
      encodeTime: 150,
      decodeTime: 100,
      inputSize: 15,
      outputSize: 30
    });
  });

  test('應該限制樣本數量', () => {
    const collector = new MetricsCollector(2);
    
    for (let i = 0; i < 5; i++) {
      collector.record('test', {
        encodeTime: i * 100,
        decodeTime: 0,
        inputSize: 10,
        outputSize: 20,
        timestamp: Date.now()
      });
    }

    const trend = collector.getTrend('test', 'encodeTime');
    expect(trend).toHaveLength(2);
    expect(trend[0]).toBe(300);
    expect(trend[1]).toBe(400);
  });

  test('性能監控裝飾器應該正確工作', () => {
    class TestEncoder {
      @measurePerformance('test')
      encode(input: string): string {
        return input.toUpperCase();
      }
    }

    const encoder = new TestEncoder();
    encoder.encode('hello');

    const stats = metricsCollector.getStats();
    expect(stats.test).toBeDefined();
    expect(stats.test.samples).toBe(1);
    expect(stats.test.averageEncodeTime).toBeGreaterThan(0);
  });

  test('應該正確清除性能指標', () => {
    metricsCollector.record('test1', {
      encodeTime: 100,
      decodeTime: 50,
      inputSize: 10,
      outputSize: 20,
      timestamp: Date.now()
    });

    metricsCollector.record('test2', {
      encodeTime: 200,
      decodeTime: 150,
      inputSize: 20,
      outputSize: 40,
      timestamp: Date.now()
    });

    metricsCollector.clearMethod('test1');
    const stats = metricsCollector.getStats();
    expect(stats.test1).toBeUndefined();
    expect(stats.test2).toBeDefined();

    metricsCollector.clear();
    expect(metricsCollector.getStats()).toEqual({});
  });

  test('應該處理無效的方法名稱', () => {
    expect(metricsCollector.getAverageMetrics('invalid')).toBeNull();
    expect(metricsCollector.getTrend('invalid', 'encodeTime')).toEqual([]);
  });
}); 