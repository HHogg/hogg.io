import { useEffect, useState } from 'react';
import api, { WasmWorkerApi } from './api';
import { getState, addStateChangeListener, WasmWorkerState } from './state';

export type UseWasmWorkerResult = WasmWorkerState & {
  api: WasmWorkerApi;
};

export default function useWasmWorker() {
  const [{ loadings, isLoading, errors }, updateState] = useState(getState());

  useEffect(() => {
    return addStateChangeListener(updateState);
  }, [updateState]);

  return { api, loadings, isLoading, errors };
}
