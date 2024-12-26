import { useEffect } from 'react';
import {
  addEventListener,
  WasmWorkerEventByName,
  WasmWorkerEventName,
} from '../WasmWorker/state';

export function useWasmAddEventListener<TEventName extends WasmWorkerEventName>(
  name: TEventName,
  listener: (event: WasmWorkerEventByName<TEventName>) => void
) {
  useEffect(() => {
    return addEventListener(name, listener);
  }, [name, listener]);
}
