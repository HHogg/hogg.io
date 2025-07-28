import { Spinner } from '@hogg/common';
import { Appear, AppearProps } from 'preshape';
import { PropsWithChildren } from 'react';
import { useWasmApi } from './useWasmApi';

export default function WasmApiLoadingScreen({
  children,
  ...props
}: PropsWithChildren<AppearProps>) {
  const { loadings } = useWasmApi();

  if (loadings.init) {
    return <Spinner>Wasm loading...</Spinner>;
  }

  return (
    <Appear
      {...props}
      animation="Fade"
      flex="vertical"
      grow
      delay={200}
      width="100%"
    >
      {children}
    </Appear>
  );
}
