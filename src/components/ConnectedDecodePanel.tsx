import React from 'react';
import { useAppState, useAppDispatch, useDecoder } from '../store/context';
import DecodePanel from './DecodePanel';
import { DecodeMethod, OperationType } from '../types';

const ConnectedDecodePanel = () => {
  const { selectedMethods, operationType, isProcessing } = useAppState();
  const dispatch = useAppDispatch();
  const { decode } = useDecoder();

  const handleMethodsChange = (methods: DecodeMethod[]) => {
    dispatch({ type: 'SET_SELECTED_METHODS', payload: methods });
  };

  const handleOperationTypeChange = (type: OperationType) => {
    dispatch({ type: 'SET_OPERATION_TYPE', payload: type });
  };

  const handleClear = () => {
    dispatch({ type: 'CLEAR_RESULTS' });
  };

  return (
    <DecodePanel
      selectedMethods={selectedMethods}
      onMethodsChange={handleMethodsChange}
      onDecode={decode}
      onClear={handleClear}
      isDecoding={isProcessing}
      operationType={operationType}
      onOperationTypeChange={handleOperationTypeChange}
    />
  );
};

export default ConnectedDecodePanel; 