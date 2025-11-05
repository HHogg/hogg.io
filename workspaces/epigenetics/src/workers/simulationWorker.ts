import * as Comlink from 'comlink';

export interface SimulationWorkerApi {
  init(): Promise<boolean>;
  initSharedBuffer(buffer: SharedArrayBuffer): Promise<void>;
  initCanvas(canvas: OffscreenCanvas): Promise<void>;
  setDimensions(width: number, height: number): Promise<void>;
  setUpdateInterval(frames: number): Promise<void>;
  writeShaderData(
    buffer: SharedArrayBuffer,
    offset: number,
    data: Uint8Array
  ): Promise<void>;
  readShaderData(
    buffer: SharedArrayBuffer,
    offset: number,
    length: number
  ): Promise<Uint8Array>;
  stopLoop(): Promise<void>;
}

let simulationWorker: Worker | undefined;
let simulationWorkerProxy: Comlink.Remote<SimulationWorkerApi> | undefined;

export function getSimulationWorker(): Comlink.Remote<SimulationWorkerApi> {
  if (!simulationWorkerProxy) {
    if (typeof Worker === 'undefined') {
      throw new Error('Web Workers are not supported in this environment');
    }

    simulationWorker = new Worker(
      new URL('./simulation.worker.ts', import.meta.url),
      { type: 'module' }
    );

    simulationWorker.addEventListener('message', (event: MessageEvent) => {
      if (event.data && event.data.type === 'bufferUpdated') {
        // devLog('Buffer updated at frame:', event.data.frame);
      }
    });

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
