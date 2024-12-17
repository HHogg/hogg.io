import { useEffect } from 'react';
import { WasmApi, WasmApiKey } from '../WasmWorker/WasmWorker';
import { addEventListener } from '../WasmWorker/state';

export function useWasmAddEventListener(
  key: WasmApiKey,
  listener: (data: ReturnType<WasmApi[WasmApiKey]>) => void
) {
  useEffect(() => {
    return addEventListener(key, listener);
  }, [key, listener]);
}
