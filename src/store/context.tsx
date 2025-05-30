import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, AppAction } from './types';
import { reducer, initialState } from './reducer';

const AppStateContext = createContext<AppState | undefined>(undefined);
const AppDispatchContext = createContext<React.Dispatch<AppAction> | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 初始化主題
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      dispatch({ type: 'TOGGLE_DARK_MODE' });
    }
  }, []);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
}

// 自定義 hooks
export function useDecoder() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const decode = async () => {
    if (!state.input.trim() && state.selectedMethods.every(m => m !== 'morse')) {
      dispatch({ type: 'SET_ERROR', payload: '請輸入要處理的內容！' });
      return;
    }

    if (state.selectedMethods.length === 0) {
      dispatch({
        type: 'SET_ERROR',
        payload: `請選擇至少一種${state.operationType === 'encode' ? '加密' : '解密'}方式！`
      });
      return;
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const results = await Promise.all(
        state.selectedMethods.map(async method => {
          try {
            const result = await decodeWithMethod(
              method,
              state.input,
              state.decoderOptions,
              state.operationType
            );
            return {
              method,
              status: 'success' as const,
              result,
              timestamp: Date.now()
            };
          } catch (error) {
            return {
              method,
              status: 'error' as const,
              result: error instanceof Error ? error.message : '處理失敗',
              timestamp: Date.now()
            };
          }
        })
      );

      dispatch({ type: 'SET_RESULTS', payload: results });
      results.forEach(result => {
        dispatch({ type: 'ADD_TO_HISTORY', payload: result });
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : '處理失敗'
      });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  return {
    decode,
    isProcessing: state.isProcessing,
    results: state.results,
    error: state.error
  };
}

export function useTheme() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  return {
    isDarkMode: state.isDarkMode,
    toggleTheme
  };
}

export function useHistory() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  return {
    history: state.history,
    clearHistory
  };
}

// 輔助函數
async function decodeWithMethod(
  method: string,
  input: string,
  options: any,
  operationType: 'encode' | 'decode'
): Promise<string> {
  // 這裡需要實現實際的解碼邏輯
  // 可以從現有的 decoders.ts 中導入相關函數
  return Promise.resolve('TODO: Implement actual decoding');
} 