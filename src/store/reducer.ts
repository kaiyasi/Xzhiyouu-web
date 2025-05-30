import { AppState, AppAction } from './types';

export const initialState: AppState = {
  input: '',
  selectedMethods: [],
  results: [],
  history: [],
  isProcessing: false,
  error: null,
  isDarkMode: false,
  operationType: 'decode',
  currentFile: null,
  fileType: null,
  decoderOptions: {}
};

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.payload };

    case 'SET_SELECTED_METHODS':
      return { ...state, selectedMethods: action.payload };

    case 'SET_RESULTS':
      return { ...state, results: action.payload };

    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [action.payload, ...state.history].slice(0, 100) // 限制歷史記錄數量
      };

    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'TOGGLE_DARK_MODE':
      const newMode = !state.isDarkMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return { ...state, isDarkMode: newMode };

    case 'SET_OPERATION_TYPE':
      return { ...state, operationType: action.payload };

    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.payload };

    case 'SET_FILE_TYPE':
      return { ...state, fileType: action.payload };

    case 'SET_DECODER_OPTIONS':
      return { ...state, decoderOptions: action.payload };

    default:
      return state;
  }
} 