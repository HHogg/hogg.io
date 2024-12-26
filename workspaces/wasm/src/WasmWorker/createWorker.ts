import { WrapNestedFunctionsInPromise } from '@hogg/common';
import { WasmApi, WasmApiKey } from './WasmWorker';
import {
  createRequest,
  handleMessageResponse,
  handleMessageEvent,
  isWorkerMessageResponse,
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
export type WasmWorkerApi = WrapNestedFunctionsInPromise<WasmApi>;

const apisAvailable: Record<WasmApiKey, boolean> = {
  ['circularSequence.getSequenceLength']: true,
  ['circularSequence.getSequenceMinPermutation']: true,
  ['circularSequence.getSequenceSymmetryIndex']: true,
  ['circularSequence.isSequenceSymmetrical']: true,
  ['circularSequence.sequenceToString']: true,
  ['circularSequence.sortSequence']: true,
  ['lineSegmentExtending.getExtendedLineSegment']: true,
  ['tilings.findNextTiling']: true,
  ['tilings.findPreviousTiling']: true,
  ['tilings.parseNotation']: true,
  ['tilings.parseTransform']: true,
  ['tilings.renderTiling']: true,
  ['tilings.transferCanvas']: true,
  ['tilings.startPlayer']: true,
  ['tilings.stopPlayer']: true,
  ['tilings.setPlayerCanvasSize']: true,
  ['tilings.setPlayerExpansionPhases']: true,
  ['tilings.setPlayerNotation']: true,
  ['tilings.setPlayerRenderOptions']: true,
  ['tilings.setPlayerSpeed']: true,
  ['tilings.controlPlayerPlay']: true,
  ['tilings.controlPlayerPause']: true,
  ['tilings.controlPlayerStepForward']: true,
  ['tilings.controlPlayerStepBackward']: true,
  ['tilings.controlPlayerToStart']: true,
  ['tilings.controlPlayerToEnd']: true,
};

const apiKeys = Object.keys(apisAvailable).filter(
  (key) => apisAvailable[key as WasmApiKey]
) as WasmApiKey[];

const api = {} as WasmWorkerApi;

for (const key of apiKeys) {
  const [ns, fnName] = key.split('.') as [keyof WasmWorkerApi, string];
  const apiNs = api[ns] ?? (api[ns] = {} as any);

  (apiNs as Record<string, any>)[fnName] = (
    args: any[],
    transfer = []
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      worker?.postMessage(createRequest(key, args, resolve, reject), transfer);
    });
  };
}

if (worker) {
  worker.onmessage = ({ data }: MessageEvent<WasmWorkerMessageResponse>) => {
    if (isWorkerMessageResponse(data)) {
      handleMessageResponse(data);
    } else {
      handleMessageEvent(data);
    }
  };
}

export default api;
