import { DecodeMethod, DecoderOptions, DecodeResult } from '../types';

export interface AppState {
  // 輸入相關
  input: string;
  selectedMethods: DecodeMethod[];
  results: DecodeResult[];
  history: DecodeResult[];
  
  // 處理狀態
  isProcessing: boolean;
  error: string | null;
  
  // UI 狀態
  isDarkMode: boolean;
  operationType: 'encode' | 'decode';
  
  // 文件處理
  currentFile: File | null;
  fileType: string | null;
  
  // 解碼器選項
  decoderOptions: {
    [key in DecodeMethod]?: DecoderOptions;
  };
}

export type AppAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_SELECTED_METHODS'; payload: DecodeMethod[] }
  | { type: 'SET_RESULTS'; payload: DecodeResult[] }
  | { type: 'ADD_TO_HISTORY'; payload: DecodeResult }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_OPERATION_TYPE'; payload: 'encode' | 'decode' }
  | { type: 'SET_CURRENT_FILE'; payload: File | null }
  | { type: 'SET_FILE_TYPE'; payload: string | null }
  | { type: 'SET_DECODER_OPTIONS'; payload: { [key in DecodeMethod]?: DecoderOptions } }; 