import { createContext, useContext } from 'react';

export const WasmContext = createContext<any>({});

export function useWasmContext<TApi>() {
  return useContext(WasmContext) as TApi;
}
