import React from 'react';
import { useDecoder } from '../store/context';
import HashPanel from './HashPanel';
import { DecoderOptions } from '../types';

const ConnectedHashPanel = () => {
  const { decode } = useDecoder();

  const handleDecode = async (input: string, options: DecoderOptions): Promise<void> => {
    await decode();
  };

  const handleCrack = async (hash: string, algorithm: string): Promise<void> => {
    // TODO: 實現雜湊破解功能
    await new Promise<void>(resolve => {
      setTimeout(resolve, 0);
    });
  };

  return <HashPanel onDecode={handleDecode} onCrack={handleCrack} />;
};

export default ConnectedHashPanel; 