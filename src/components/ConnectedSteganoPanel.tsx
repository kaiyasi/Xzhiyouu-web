import React from 'react';
import { useDecoder } from '../store/context';
import SteganoPanel from './SteganoPanel';

const ConnectedSteganoPanel = () => {
  const { decode } = useDecoder();
  return <SteganoPanel onDecode={decode} />;
};

export default ConnectedSteganoPanel; 