import React from 'react';
import { useAppState, useAppDispatch } from '../store/context';
import HistoryPanel from './HistoryPanel';

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

export default ConnectedHistoryPanel; 