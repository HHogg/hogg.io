import { WasmProvider } from '@hogg/common';
import { PropsWithChildren } from 'react';
import loader from '../../../pkg';
import { wasmApi } from './useWasmApi';

export default function WasmApi(props: PropsWithChildren) {
  return <WasmProvider {...props} api={wasmApi} loader={loader} />;
}
