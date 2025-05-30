import React from 'react';
import { useAppState, useAppDispatch } from '../store/context';
import SettingsPanel from './SettingsPanel';

const ConnectedSettingsPanel: React.FC = () => {
  const { selectedMethods, decoderOptions } = useAppState();
  const dispatch = useAppDispatch();

  // 如果沒有選擇任何方法，返回 null
  if (selectedMethods.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {selectedMethods.map(method => (
        <SettingsPanel
          key={method}
          method={method}
          options={decoderOptions[method] || {}}
          onOptionsChange={(newOptions) => {
            dispatch({
              type: 'SET_DECODER_OPTIONS',
              payload: {
                ...decoderOptions,
                [method]: newOptions
              }
            });
          }}
        />
      ))}
    </div>
  );
};

export default ConnectedSettingsPanel; 