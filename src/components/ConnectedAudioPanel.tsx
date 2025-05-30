import React from 'react';
import { useDecoder, useAppDispatch } from '../store/context';
import AudioPanel from './AudioPanel';

const ConnectedAudioPanel = () => {
  const { decode } = useDecoder();
  const dispatch = useAppDispatch();

  const handleAnalyze = async (buffer: AudioBuffer) => {
    dispatch({ type: 'SET_AUDIO_BUFFER', payload: buffer });
  };

  return (
    <AudioPanel
      onDecode={decode}
      onAnalyze={handleAnalyze}
    />
  );
};

export default ConnectedAudioPanel; 