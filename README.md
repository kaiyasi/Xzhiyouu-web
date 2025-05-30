# 現代化加密/解密工具

一個功能豐富的加密和解密工具，使用 React 和 Tailwind CSS 構建。

## 功能特點

- 支援多種編碼格式：
  - Base32/58/85/91
  - Brainfuck/JSFuck/AAencode
  - Whitespace/Zero-width
  - UUencode/XXencode
  - Tap 碼/Phonetic 碼
  - DNA 編碼
- 完整的錯誤處理系統
- 性能優化（緩存和延遲加載）
- 現代化的用戶界面
- 完整的單元測試覆蓋
- TypeScript 類型安全

## 安裝

```bash
# 克隆倉庫
git clone https://github.com/yourusername/modern-crypto-tool.git

# 安裝依賴
cd modern-crypto-tool
npm install
```

## 開發

```bash
# 啟動開發服務器
npm run dev

# 運行測試
npm test

# 構建生產版本
npm run build
```

## 使用示例

### 基本編碼/解碼

```typescript
import { encodeDNA, decodeDNA } from './utils/dnaEncoder';

// DNA 編碼
const encoded = encodeDNA('Hello, World!', '1');
console.log(encoded); // 輸出 DNA 序列

// DNA 解碼
const decoded = decodeDNA(encoded, '1');
console.log(decoded); // 輸出 "Hello, World!"
```

### 使用緩存

```typescript
import { LRUCache } from './utils/cache';

const cache = new LRUCache({
  enabled: true,
  maxSize: 100,
  ttl: 3600000 // 1 小時
});

// 緩存編碼結果
cache.set('dna', 'Hello', encoded, { encoding: '1' });

// 從緩存獲取結果
const cachedResult = cache.get('dna', 'Hello', { encoding: '1' });
```

### 性能監控

```typescript
import { metricsCollector } from './utils/metrics';

// 獲取性能統計
const stats = metricsCollector.getStats();
console.log(stats);

// 獲取特定方法的性能趨勢
const trend = metricsCollector.getTrend('dna', 'encodeTime', 10);
console.log(trend);
```

## 錯誤處理

```typescript
import { EncoderError, EncoderErrorType } from './utils/errors';

try {
  const result = encodeDNA('invalid input', '1');
} catch (error) {
  if (error instanceof EncoderError) {
    console.error(`錯誤類型: ${error.type}`);
    console.error(`錯誤信息: ${error.message}`);
  }
}
```

## 配置選項

### DNA 編碼選項

- `encoding`: 選擇編碼方式
  - `'1'`: A=00,C=01,G=10,T=11
  - `'2'`: A=01,C=10,G=11,T=00
  - `'3'`: A=11,C=00,G=01,T=10

### 緩存配置

- `enabled`: 是否啟用緩存
- `maxSize`: 最大緩存項數量
- `ttl`: 緩存項過期時間（毫秒）

## 貢獻

歡迎提交 Pull Request 和 Issue！

## 許可證

MIT
