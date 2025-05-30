import React from 'react';
import { useAppDispatch } from '../store/context';
import FileUploadPanel from './FileUploadPanel';

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

export default ConnectedFileUploadPanel; 