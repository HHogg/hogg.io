import { useState, useEffect, PropsWithChildren } from 'react';
import { initWasm, parseNotation, parseTransform } from '../utils/wasm';
import { WasmContext } from './useWasmContext';

export default function WasmProvider(props: PropsWithChildren<{}>) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initWasm().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <WasmContext.Provider
      value={{
        parseNotation,
        parseTransform,
      }}
      {...props}
    />
  );
}
