import { DecoderOptions } from '../types';

export interface ImageMetadata {
  format: string;
  width: number;
  height: number;
  bitsPerPixel: number;
  hasAlpha: boolean;
  metadata: Record<string, string>;
}

export interface SteganoResult {
  success: boolean;
  message?: string;
  data?: string;
  metadata?: ImageMetadata;
}

export async function analyzeImage(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('無法創建 canvas 上下文'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const hasAlpha = imageData.data[3] !== undefined;
      
      const metadata: ImageMetadata = {
        format: file.type,
        width: img.width,
        height: img.height,
        bitsPerPixel: hasAlpha ? 32 : 24,
        hasAlpha,
        metadata: {}
      };
      
      resolve(metadata);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('圖片加載失敗'));
    };
    
    img.src = url;
  });
}

export async function detectSteganography(
  file: File,
  options: DecoderOptions
): Promise<SteganoResult> {
  try {
    switch (options.steganoMethod) {
      case 'lsb':
        return await extractLSB(file, options);
      case 'metadata':
        return await analyzeMetadata(file);
      case 'eog':
        return await checkEndOfFile(file);
      default:
        throw new Error('不支援的隱寫方法');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '隱寫分析失敗'
    };
  }
}

async function extractLSB(
  file: File,
  options: DecoderOptions
): Promise<SteganoResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('無法創建 canvas 上下文'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const pixels = imageData.data;
      
      const bitsPerChannel = options.bitsPerChannel || 1;
      let extractedBits = '';
      
      // 從每個像素通道提取最低位
      for (let i = 0; i < pixels.length; i += 4) {
        for (let j = 0; j < 3; j++) { // RGB 通道
          for (let k = 0; k < bitsPerChannel; k++) {
            const bit = (pixels[i + j] >> k) & 1;
            extractedBits += bit;
          }
        }
      }
      
      // 將二進制轉換為文本
      let extractedText = '';
      for (let i = 0; i < extractedBits.length; i += 8) {
        const byte = extractedBits.substr(i, 8);
        const charCode = parseInt(byte, 2);
        if (charCode === 0) break; // 遇到 null 終止符
        extractedText += String.fromCharCode(charCode);
      }
      
      resolve({
        success: true,
        data: extractedText,
        metadata: {
          format: file.type,
          width: img.width,
          height: img.height,
          bitsPerPixel: 24,
          hasAlpha: true,
          metadata: {}
        }
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('圖片加載失敗'));
    };
    
    img.src = url;
  });
}

async function analyzeMetadata(file: File): Promise<SteganoResult> {
  try {
    const metadata: Record<string, string> = {};
    
    // 讀取 EXIF 數據
    if (file.type === 'image/jpeg' || file.type === 'image/tiff') {
      const arrayBuffer = await file.arrayBuffer();
      const view = new DataView(arrayBuffer);
      
      // 檢查 JPEG 標記
      if (view.getUint16(0) === 0xFFD8) {
        let offset = 2;
        
        while (offset < view.byteLength) {
          const marker = view.getUint16(offset);
          
          // 檢查 APP1 標記（EXIF 數據）
          if (marker === 0xFFE1) {
            const length = view.getUint16(offset + 2);
            const exifData = new Uint8Array(arrayBuffer, offset + 4, length - 2);
            
            // 解析 EXIF 數據
            const exifString = new TextDecoder().decode(exifData);
            if (exifString.includes('EXIF')) {
              metadata['EXIF'] = exifString;
            }
          }
          
          offset += 2 + view.getUint16(offset + 2);
        }
      }
    }
    
    // 檢查是否包含隱藏數據
    const img = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('無法創建 canvas 上下文');
    }
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const pixels = imageData.data;
    
    // 檢查圖片末尾是否有額外數據
    let hasHiddenData = false;
    for (let i = pixels.length - 4; i < pixels.length; i++) {
      if (pixels[i] !== 0) {
        hasHiddenData = true;
        break;
      }
    }
    
    return {
      success: true,
      message: hasHiddenData ? '發現可能的隱藏數據' : '未發現隱藏數據',
      metadata: {
        format: file.type,
        width: img.width,
        height: img.height,
        bitsPerPixel: 32,
        hasAlpha: true,
        metadata
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '元數據分析失敗'
    };
  }
}

async function checkEndOfFile(file: File): Promise<SteganoResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const view = new Uint8Array(arrayBuffer);
    
    // 檢查文件結尾的額外數據
    let endMarker = -1;
    for (let i = view.length - 1; i >= 0; i--) {
      if (view[i] !== 0) {
        endMarker = i;
        break;
      }
    }
    
    if (endMarker === -1) {
      return {
        success: false,
        message: '未發現文件結尾數據'
      };
    }
    
    // 提取結尾數據
    const endData = view.slice(endMarker - 100, endMarker + 1);
    const decoder = new TextDecoder();
    const text = decoder.decode(endData);
    
    return {
      success: true,
      message: '發現文件結尾數據',
      data: text
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '文件結尾分析失敗'
    };
  }
}

// 圖片格式轉換
export async function convertImageFormat(
  file: File,
  targetFormat: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('無法創建 canvas 上下文'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('圖片轉換失敗'));
          }
        },
        `image/${targetFormat}`,
        0.92
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('圖片加載失敗'));
    };
    
    img.src = url;
  });
}

// 圖片大小調整
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = Math.round(width * (maxHeight / height));
        height = maxHeight;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('無法創建 canvas 上下文'));
        return;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('圖片調整大小失敗'));
          }
        },
        file.type,
        0.92
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('圖片加載失敗'));
    };
    
    img.src = url;
  });
} 