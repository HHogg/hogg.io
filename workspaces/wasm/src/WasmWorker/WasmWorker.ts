import { type NestedKeyOf } from '@hogg/common';
import get from 'lodash.get';
import init from '@hogg/wasm/pkg';
import * as circularSequence from './modules/circular-sequence';
import * as lineSegmentExtending from './modules/line-segment-extending';
import * as tilings from './modules/tilings';
import { WasmWorkerMessageRequest, WasmWorkerMessageResponse } from './state';

let ready = false;

const wasmApi = {
  circularSequence,
  lineSegmentExtending,
  tilings,
};

export type WasmApi = typeof wasmApi;
export type WasmApiKey = NestedKeyOf<WasmApi>;

init({}).then(() => {
  ready = true;
  postMessage({ key: '_init', result: ready });
});

onmessage = async ({ data }: MessageEvent<WasmWorkerMessageRequest>) => {
  const { id, args, key } = data;
  const fn = get(wasmApi, key);

  if (!ready) {
    const response: WasmWorkerMessageResponse = {
      id,
      key,
      error: `Wasm not ready (${data.key})`,
      result: null,
    };

    postMessage(response);
    return;
  }

  if (!fn) {
    const response: WasmWorkerMessageResponse = {
      id,
      key,
      error: `Api "${key}" not found`,
      result: null,
    };

    postMessage(response);
    return;
  }

  try {
    // @ts-ignore
    const result = fn(...args);

    const response: WasmWorkerMessageResponse = {
      id,
      key,
      result,
    };

    postMessage(response);
  } catch (error) {
    const response: WasmWorkerMessageResponse = {
      id,
      key,
      error: (error as Error).message,
      result: null,
    };

    postMessage(response);
  }
};
