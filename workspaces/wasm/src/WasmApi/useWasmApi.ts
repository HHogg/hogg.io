import { createContext, useContext } from 'react';
import { UseWasmWorkerResult } from '../WasmWorker/useWasmWorker';

export const WasmApiContext = createContext<UseWasmWorkerResult | null>(null);

export function useWasmApi(): UseWasmWorkerResult {
  const value = useContext(WasmApiContext);

  if (!value) {
    throw new Error('useWasmApi must be used within a WasmProvider');
  }

  return value;
}
