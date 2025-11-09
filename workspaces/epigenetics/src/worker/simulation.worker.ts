import * as Comlink from 'comlink';
import init, {
  transfer_canvas as wasmTransferCanvas,
  refresh_dimensions as wasmRefreshDimensions,
  init_simulation as wasmInitSimulation,
  start_simulation_loop as wasmStartSimulationLoop,
  stop_simulation_loop as wasmStopSimulationLoop,
  set_post_update_interval as wasmSetPostUpdateInterval,
} from '../../pkg/hogg_epigenetics_worker/hogg_epigenetics_worker';

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
});

const simulationWorkerApi = {
  async transferCanvas(canvas: OffscreenCanvas) {
    await waitForWasmReady();
    wasmTransferCanvas(canvas);
  },

  async refreshDimensions(width: number, height: number) {
    await waitForWasmReady();
    wasmRefreshDimensions(width, height);
  },

  async initSimulation() {
    await waitForWasmReady();
    wasmInitSimulation();
  },

  async startSimulationLoop() {
    await waitForWasmReady();
    wasmStartSimulationLoop();
  },

  async stopSimulationLoop() {
    await waitForWasmReady();
    wasmStopSimulationLoop();
  },

  async setPostUpdateInterval(frames: number) {
    await waitForWasmReady();
    wasmSetPostUpdateInterval(frames);
  },
};

Comlink.expose(simulationWorkerApi);
