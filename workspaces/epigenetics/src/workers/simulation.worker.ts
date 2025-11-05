import * as Comlink from 'comlink';
import init, {
  init_shared_buffer as wasmInitSharedBuffer,
  init_canvas as wasmInitCanvas,
  set_dimensions as wasmSetDimensions,
  set_update_interval as wasmSetUpdateInterval,
  write_shader_data as wasmWriteShaderData,
  read_shader_data as wasmReadShaderData,
  stop_simulation_loop as wasmStopSimulationLoop,
} from '../../pkg/hogg_epigenetics_worker/hogg_epigenetics_worker';
import { devLog, devWarn } from '../devLog';

let wasmReady = false;

async function waitForWasmReady(): Promise<void> {
  if (!wasmReady) {
    await new Promise<void>((resolve) => {
      const checkReady = () => {
        if (wasmReady) {
          resolve();
        } else {
          setTimeout(checkReady, 10);
        }
      };
      checkReady();
    });
  }
}

init().then(() => {
  wasmReady = true;
  devLog('Simulation worker: WASM initialized');
});

const simulationWorkerApi = {
  async init() {
    await waitForWasmReady();
    return wasmReady;
  },

  async initSharedBuffer(buffer: SharedArrayBuffer) {
    await waitForWasmReady();
    wasmInitSharedBuffer(buffer);
  },

  async initCanvas(canvas: OffscreenCanvas) {
    await waitForWasmReady();
    wasmInitCanvas(canvas);
  },

  async setDimensions(width: number, height: number) {
    await waitForWasmReady();
    wasmSetDimensions(width, height);
  },

  async setUpdateInterval(frames: number) {
    await waitForWasmReady();
    wasmSetUpdateInterval(frames);
  },

  async writeShaderData(
    buffer: SharedArrayBuffer,
    offset: number,
    data: Uint8Array
  ) {
    const uint8View = new Uint8Array(buffer);
    wasmWriteShaderData(uint8View, offset, data);
  },

  async readShaderData(
    buffer: SharedArrayBuffer,
    offset: number,
    length: number
  ): Promise<Uint8Array> {
    await waitForWasmReady();
    const uint8View = new Uint8Array(buffer);
    const data = wasmReadShaderData(uint8View, offset, length);
    return new Uint8Array(data);
  },

  async stopLoop() {
    if (!wasmReady) {
      return;
    }

    try {
      wasmStopSimulationLoop();
    } catch (err) {
      devWarn(
        'Failed to stop simulation loop (may not have been started):',
        err
      );
    }
  },
};

Comlink.expose(simulationWorkerApi);
