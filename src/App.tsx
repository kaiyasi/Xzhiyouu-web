import React from 'react';
import { motion } from 'framer-motion';
import { AppProvider } from './store/context';
import DecodePanel from './components/DecodePanel';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import FileUploadPanel from './components/FileUploadPanel';
import SteganoPanel from './components/SteganoPanel';
import AudioPanel from './components/AudioPanel';
import ConnectedHashPanel from './components/ConnectedHashPanel';
import HistoryPanel from './components/HistoryPanel';
import ThemeToggle from './components/ThemeToggle';
import { useAppState, useAppDispatch, useDecoder } from './store/context';

// 包裝組件以使用狀態管理
const ConnectedDecodePanel = () => {
  const { selectedMethods, operationType, isProcessing } = useAppState();
  const dispatch = useAppDispatch();
  const { decode } = useDecoder();

  return (
    <DecodePanel
      selectedMethods={selectedMethods}
      onMethodsChange={(methods) => dispatch({ type: 'SET_SELECTED_METHODS', payload: methods })}
      onDecode={decode}
      onClear={() => {
        dispatch({ type: 'SET_INPUT', payload: '' });
        dispatch({ type: 'SET_SELECTED_METHODS', payload: [] });
        dispatch({ type: 'SET_RESULTS', payload: [] });
        dispatch({ type: 'SET_DECODER_OPTIONS', payload: {} });
      }}
      isDecoding={isProcessing}
      operationType={operationType}
      onOperationTypeChange={(type) => dispatch({ type: 'SET_OPERATION_TYPE', payload: type })}
    />
  );
};

const ConnectedInputPanel = () => {
  const { input } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <InputPanel
      input={input}
      onInputChange={(value) => dispatch({ type: 'SET_INPUT', payload: value })}
      onWavFile={(buffer) => dispatch({ type: 'SET_AUDIO_BUFFER', payload: buffer })}
    />
  );
};

const ConnectedFileUploadPanel = () => {
  const dispatch = useAppDispatch();

  return (
    <FileUploadPanel
      onFileUpload={(file) => {
        dispatch({ type: 'SET_CURRENT_FILE', payload: file });
        dispatch({ type: 'SET_FILE_TYPE', payload: file.type });
      }}
    />
  );
};

const ConnectedOutputPanel = () => {
  const { results } = useAppState();
  return <OutputPanel results={results} />;
};

const ConnectedSteganoPanel = () => {
  const { decode } = useDecoder();
  return <SteganoPanel onDecode={decode} />;
};

const ConnectedAudioPanel = () => {
  const { decode } = useDecoder();
  const dispatch = useAppDispatch();

  return (
    <AudioPanel
      onDecode={decode}
      onAnalyze={(buffer) => dispatch({ type: 'SET_AUDIO_BUFFER', payload: buffer })}
    />
  );
};

const ConnectedHistoryPanel = () => {
  const { history } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <HistoryPanel
      history={history}
      onClear={() => dispatch({ type: 'CLEAR_HISTORY' })}
      onRestore={(result) => {
        dispatch({ type: 'SET_INPUT', payload: result.result });
        dispatch({ type: 'SET_SELECTED_METHODS', payload: [result.method] });
      }}
      onDelete={(index) => {
        const newHistory = [...history];
        newHistory.splice(index, 1);
        dispatch({ type: 'SET_RESULTS', payload: newHistory });
      }}
    />
  );
};

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                解密工具箱
              </h1>
              <ThemeToggle />
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              支援多種解密方法，包括古典密碼、現代密碼和隱寫術
            </p>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <InputPanel />
              <DecodePanel />
            </section>

            <section>
              <OutputPanel />
              <HistoryPanel />
            </section>

            <section className="md:col-span-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FileUploadPanel />
                <SteganoPanel />
                <AudioPanel />
                <ConnectedHashPanel />
              </div>
            </section>
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App; 