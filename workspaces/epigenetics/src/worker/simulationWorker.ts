import * as Comlink from 'comlink';
import {
  HandlerWireValue,
  RawWireValue,
  WireValue,
} from 'comlink/dist/umd/protocol';
import { Message } from './types';

export interface SimulationWorkerApi {
  initSimulation(): Promise<void>;
  refreshDimensions(width: number, height: number): Promise<void>;
  setPostUpdateInterval(frames: number): Promise<void>;
  startSimulationLoop(): Promise<void>;
  stopSimulationLoop(): Promise<void>;
  transferCanvas(canvas: OffscreenCanvas): Promise<void>;
}

let simulationWorker: Worker | undefined;
let simulationWorkerProxy: Comlink.Remote<SimulationWorkerApi> | undefined;

const isSimulationWorkerMessage = (
  message: Message | WireValue
): message is Message => {
  return 'name' in message;
};

const isComLinkHandlerMessage = (
  message: Message | WireValue
): message is HandlerWireValue => {
  return 'type' in message && message.type === 'HANDLER';
};

const isComLinkRawMessage = (
  message: Message | WireValue
): message is RawWireValue => {
  return 'type' in message && message.type === 'RAW';
};

export function getSimulationWorker(
  onError: (error: string) => void,
  onMessage: (message: Message) => void
): Comlink.Remote<SimulationWorkerApi> {
  if (!simulationWorkerProxy) {
    if (typeof Worker === 'undefined') {
      throw new Error('Web Workers are not supported in this environment');
    }

    simulationWorker = new Worker(
      new URL('./simulation.worker.ts', import.meta.url),
      { type: 'module' }
    );

    simulationWorker.addEventListener('error', (event: ErrorEvent) => {
      console.error(event);
      onError(event.message);
    });

    simulationWorker.addEventListener(
      'message',
      (event: MessageEvent<Message | WireValue>) => {
        if (event.data) {
          if (isComLinkRawMessage(event.data)) {
            // Do nothing with raw messages
            return;
          }

          if (isComLinkHandlerMessage(event.data)) {
            if (
              event.data.name === 'throw' &&
              typeof event.data.value === 'object' &&
              event.data.value &&
              'message' in event.data.value &&
              typeof event.data.value.message === 'string'
            ) {
              onError(event.data.value.message);
            }
            return;
          }

          if (isSimulationWorkerMessage(event.data)) {
            onMessage(event.data);
          }
        }
      }
    );

    simulationWorkerProxy = Comlink.wrap<SimulationWorkerApi>(simulationWorker);
  }

  return simulationWorkerProxy;
}

export function terminateSimulationWorker() {
  if (simulationWorker) {
    simulationWorker.terminate();
    simulationWorker = undefined;
    simulationWorkerProxy = undefined;
  }
}
