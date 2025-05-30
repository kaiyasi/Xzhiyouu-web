import React from 'react';
import { useAppState } from '../store/context';
import OutputPanel from './OutputPanel';

const ConnectedOutputPanel = () => {
  const { results } = useAppState();
  return <OutputPanel results={results} />;
};

export default ConnectedOutputPanel; 