import { Appear } from 'preshape';
import { useState, useEffect, PropsWithChildren } from 'react';
import Spinner from '../Spinner/Spinner';
import { WasmContext } from './useWasmContext';

export type WasmProviderProps<Loader extends () => Promise<any>, Api> = {
  api: Api;
  loader: Loader;
};

export default function WasmProvider<Loader extends () => Promise<any>, Api>({
  api,
  loader,
  children,
  ...props
}: PropsWithChildren<WasmProviderProps<Loader, Api>>) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loader().then(() => {
      setIsReady(true);
    });
  }, [loader]);

  if (!isReady) {
    return <Spinner>Wasm loading...</Spinner>;
  }

  return (
    <WasmContext.Provider value={api} {...props}>
      <Appear animation="Fade" flex="vertical" grow delay={200}>
        {children}
      </Appear>
    </WasmContext.Provider>
  );
}
