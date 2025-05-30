import { DecodeMethod, DecoderOptions } from '../types';
import type { DecodeResult } from '../types';

export interface DecodeResult {
  method: DecodeMethod;
  status: 'success' | 'error';
  result: string;
  additionalInfo?: {
    type?: string;
    data?: any;
    preview?: string;
  };
  timestamp?: number;
}

export interface AppState {
  // 輸入相關
  input: string;
  selectedMethods: DecodeMethod[];
  decoderOptions: DecoderOptions;
  operationType: 'encode' | 'decode';
  
  // 處理狀態
  isProcessing: boolean;
  error: string | null;
  
  // 結果相關
  results: DecodeResult[];
  history: DecodeResult[];
  
  // UI 狀態
  isDarkMode: boolean;
  activePanel: string;
  expandedResult: number | null;
  
  // 文件處理
  currentFile: File | null;
  fileType: string | null;
  
  // 音頻處理
  isPlaying: boolean;
  audioBuffer: AudioBuffer | null;
  
  // 圖片處理
  imageData: ImageData | null;
  steganoResult: any | null;
}

export type AppAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_SELECTED_METHODS'; payload: DecodeMethod[] }
  | { type: 'SET_DECODER_OPTIONS'; payload: DecoderOptions }
  | { type: 'SET_OPERATION_TYPE'; payload: 'encode' | 'decode' }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RESULTS'; payload: DecodeResult[] }
  | { type: 'ADD_TO_HISTORY'; payload: DecodeResult }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'CLEAR_RESULTS' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_ACTIVE_PANEL'; payload: string }
  | { type: 'SET_EXPANDED_RESULT'; payload: number | null }
  | { type: 'SET_CURRENT_FILE'; payload: File | null }
  | { type: 'SET_FILE_TYPE'; payload: string | null }
  | { type: 'SET_IS_PLAYING'; payload: boolean }
  | { type: 'SET_AUDIO_BUFFER'; payload: AudioBuffer | null }
  | { type: 'SET_IMAGE_DATA'; payload: ImageData | null }
  | { type: 'SET_STEGANO_RESULT'; payload: any }; 