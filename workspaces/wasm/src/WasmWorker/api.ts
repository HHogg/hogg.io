import { WasmApi, WasmApiKey } from './WasmWorker';
import {
  createRequest,
  handleMessageResponse,
  WasmWorkerMessageResponse,
} from './state';

let worker: Worker | undefined = undefined;

// Create a new worker
if (typeof Worker === 'undefined') {
  console.error('Web Workers are not supported in this environment');
} else {
  worker = new Worker(new URL('./WasmWorker', import.meta.url), {
    type: 'module',
  });
}

// Converts an object of functions to a promise-based object of functions
// where the args have been converted to an array and the return value is a promise
export type WasmWorkerApi = {
  [K in WasmApiKey]: (
    args: Parameters<WasmApi[K]>,
    transfer?: Transferable[]
  ) => Promise<ReturnType<WasmApi[K]>>;
};

const apisAvailable: Record<WasmApiKey, boolean> = {
  // circular_sequence,
  getSequenceLength: true,
  getSequenceMinPermutation: true,
  getSequenceSymmetryIndex: true,
  isSequenceSymmetrical: true,
  sequenceToString: true,
  sortSequence: true,
  // line_segment_extending,
  getExtendedLineSegment: true,
  // tilings,
  findNextTiling: true,
  findPreviousTiling: true,
  parseNotation: true,
  parseTransform: true,
  renderNotation: true,
  transferCanvas: true,
};

const apiKeys = Object.keys(apisAvailable).filter(
  (key) => apisAvailable[key as WasmApiKey]
) as WasmApiKey[];

const api = {} as WasmWorkerApi;

for (const key of apiKeys) {
  api[key] = (args, transfer = []): Promise<any> => {
    return new Promise((resolve, reject) => {
      worker?.postMessage(createRequest(key, args, resolve, reject), transfer);
    });
  };
}

if (worker) {
  worker.onmessage = ({ data }: MessageEvent<WasmWorkerMessageResponse>) => {
    handleMessageResponse(data);
  };
}

export default api;
