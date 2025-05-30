import React from 'react';
import { motion } from 'framer-motion';
import { AppProvider } from './store/context';
import ConnectedDecodePanel from './components/ConnectedDecodePanel';
import ConnectedInputPanel from './components/ConnectedInputPanel';
import ConnectedOutputPanel from './components/ConnectedOutputPanel';
import ConnectedFileUploadPanel from './components/ConnectedFileUploadPanel';
import ConnectedSteganoPanel from './components/ConnectedSteganoPanel';
import ConnectedAudioPanel from './components/ConnectedAudioPanel';
import ConnectedHashPanel from './components/ConnectedHashPanel';
import ConnectedHistoryPanel from './components/ConnectedHistoryPanel';
import ConnectedSettingsPanel from './components/ConnectedSettingsPanel';
import ThemeToggle from './components/ThemeToggle';

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
              <ConnectedInputPanel />
              <div className="mt-4">
                <ConnectedSettingsPanel />
              </div>
              <div className="mt-4">
                <ConnectedDecodePanel />
              </div>
            </section>

            <section>
              <ConnectedOutputPanel />
              <ConnectedHistoryPanel />
            </section>

            <section className="md:col-span-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ConnectedFileUploadPanel />
                <ConnectedSteganoPanel />
                <ConnectedAudioPanel />
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