import { useEffect, useState } from 'react';
import api, { WasmWorkerApi } from './api';
import { getState, onStateChange, WasmWorkerState } from './state';

export type UseWasmWorkerResult = WasmWorkerState & {
  api: WasmWorkerApi;
};

export default function useWasmWorker() {
  const [{ loading, isLoading, errors }, updateState] = useState(getState());

  useEffect(() => {
    return onStateChange(updateState);
  }, [updateState]);

  return { api, loading, isLoading, errors };
}
