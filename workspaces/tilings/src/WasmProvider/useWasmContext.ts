import { createContext, useContext } from 'react';
import { parseNotation, parseTransform } from '../utils/wasm';

export type WasmContextProps = {
  parseNotation: typeof parseNotation;
  parseTransform: typeof parseTransform;
};

const uninitializedHandler = () => {
  throw new Error('WasmContext not initialized');
};

export const WasmContext = createContext<WasmContextProps>({
  parseNotation: uninitializedHandler,
  parseTransform: uninitializedHandler,
});

export function useWasmContext() {
  return useContext(WasmContext);
}
