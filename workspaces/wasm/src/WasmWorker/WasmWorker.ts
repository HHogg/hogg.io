import { type NestedKeyOf } from '@hogg/common';
import get from 'lodash.get';
import init from '@hogg/wasm/pkg';
import * as circularSequence from './modules/circular-sequence';
import * as lineSegmentExtending from './modules/line-segment-extending';
import * as tilings from './modules/tilings';
import {
  WasmWorkerMessageRequest,
  wasmWorkerMessageRequestToString,
  WasmWorkerMessageResponse,
  wasmWorkerMessageResponseToString,
} from './state';

const ENABLE_LOGGING =
  process.env.NODE_ENV === 'development' ||
  (typeof window !== 'undefined' && window.location.search.includes('debug'));

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

  let response: WasmWorkerMessageResponse | null = null;

  if (!ready) {
    response = {
      id,
      key,
      error: `Wasm not ready (${data.key})`,
      result: null,
    };
  }

  if (!fn) {
    response = {
      id,
      key,
      error: `Api "${key}" not found`,
      result: null,
    };
  }

  try {
    // @ts-ignore
    const result = fn(...args);

    response = {
      id,
      key,
      result,
    };
  } catch (error) {
    response = {
      id,
      key,
      error: (error as Error).message,
      result: null,
    };
  }

  if (ENABLE_LOGGING) {
    if (response) {
      // eslint-disable-next-line no-console
      console.info(
        `ℹ️ Response: ${wasmWorkerMessageResponseToString(response)}`
      );
    } else {
      // eslint-disable-next-line no-console
      console.info(`🚨 No response: ${wasmWorkerMessageRequestToString(data)}`);
    }
  }

  if (response) {
    postMessage(response);
  }
};
