import { PropsWithChildren } from 'react';
import useWasmWorkerRunner from '../WasmWorker/useWasmWorker';
import { WasmApiContext } from './useWasmApi';

export default function WasmApiProvider({ children }: PropsWithChildren) {
  const value = useWasmWorkerRunner();

  return (
    <WasmApiContext.Provider value={value}>{children}</WasmApiContext.Provider>
  );
}
