import { WasmProvider } from '@hogg/common';
import { PropsWithChildren } from 'react';
import * as tilingParser from '@hogg/tiling-parser';
import * as tilingRenderer from '@hogg/tiling-renderer';
import { wasmApi } from './useWasmApi';

let initPromise: Promise<void> | null = null;

function loader() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = Promise.all([
    tilingRenderer.default(),
    tilingParser.default(),
  ]).then(() => Promise.resolve());

  return initPromise;
}

export default function WasmApi(props: PropsWithChildren) {
  return <WasmProvider {...props} api={wasmApi} loader={loader} />;
}
