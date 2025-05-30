import { AppState, AppAction } from './types';

export const initialState: AppState = {
  input: '',
  selectedMethods: [],
  decoderOptions: {},
  operationType: 'decode',
  isProcessing: false,
  error: null,
  results: [],
  history: [],
  isDarkMode: false,
  activePanel: 'decode',
  expandedResult: null,
  currentFile: null,
  fileType: null,
  isPlaying: false,
  audioBuffer: null,
  imageData: null,
  steganoResult: null
};

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.payload };
      
    case 'SET_SELECTED_METHODS':
      return { ...state, selectedMethods: action.payload };
      
    case 'SET_DECODER_OPTIONS':
      return { ...state, decoderOptions: action.payload };
      
    case 'SET_OPERATION_TYPE':
      return { ...state, operationType: action.payload };
      
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
      
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [
          {
            ...action.payload,
            timestamp: Date.now()
          },
          ...state.history
        ].slice(0, 100) // 限制歷史記錄數量
      };
      
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
      
    case 'TOGGLE_DARK_MODE':
      const newIsDarkMode = !state.isDarkMode;
      // 更新 DOM
      if (newIsDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // 保存到 localStorage
      localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
      return { ...state, isDarkMode: newIsDarkMode };
      
    case 'SET_ACTIVE_PANEL':
      return { ...state, activePanel: action.payload };
      
    case 'SET_EXPANDED_RESULT':
      return { ...state, expandedResult: action.payload };
      
    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.payload };
      
    case 'SET_FILE_TYPE':
      return { ...state, fileType: action.payload };
      
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
      
    case 'SET_AUDIO_BUFFER':
      return { ...state, audioBuffer: action.payload };
      
    case 'SET_IMAGE_DATA':
      return { ...state, imageData: action.payload };
      
    case 'SET_STEGANO_RESULT':
      return { ...state, steganoResult: action.payload };
      
    default:
      return state;
  }
} 