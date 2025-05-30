import React from 'react';
import { useAppState, useAppDispatch } from '../store/context';
import InputPanel from './InputPanel';

const ConnectedInputPanel = () => {
  const { input } = useAppState();
  const dispatch = useAppDispatch();

  const handleInputChange = (value: string) => {
    dispatch({ type: 'SET_INPUT', payload: value });
  };

  return <InputPanel input={input} onInputChange={handleInputChange} />;
};

export default ConnectedInputPanel; 