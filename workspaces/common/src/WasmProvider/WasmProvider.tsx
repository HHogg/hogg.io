import { useState, useEffect, PropsWithChildren } from 'react';
import { WasmContext } from './useWasmContext';

export type WasmProviderProps<Loader extends () => Promise<any>, Api> = {
  api: Api;
  loader: Loader;
};

export default function WasmProvider<Loader extends () => Promise<any>, Api>({
  api,
  loader,
  ...props
}: PropsWithChildren<WasmProviderProps<Loader, Api>>) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loader().then(() => {
      setIsReady(true);
    });
  }, [loader]);

  if (!isReady) {
    return null;
  }

  return <WasmContext.Provider value={api} {...props} />;
}
