import { useEffect, useState } from 'react';
import api, { WasmWorkerApi } from './api';
import { getState, onStateChange, WasmWorkerState } from './state';

export type UseWasmWorkerResult = {
  api: WasmWorkerApi;
  loading: WasmWorkerState['loading'];
  errors: WasmWorkerState['errors'];
};

export default function useWasmWorker() {
  const [{ loading, errors }, updateState] = useState(getState());

  useEffect(() => {
    return onStateChange(updateState);
  }, [updateState]);

  return { api, loading, errors };
}
