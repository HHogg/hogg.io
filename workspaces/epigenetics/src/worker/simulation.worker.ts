import * as Comlink from 'comlink';
import init, {
  transfer_canvas as wasmTransferCanvas,
  init_simulation as wasmInitSimulation,
  start_simulation_loop as wasmStartSimulationLoop,
  stop_simulation_loop as wasmStopSimulationLoop,
  pause_simulation as wasmPauseSimulation,
  resume_simulation as wasmResumeSimulation,
  reset_simulation as wasmResetSimulation,
  step_simulation_frame as wasmStepSimulationFrame,
  set_post_update_interval as wasmSetPostUpdateInterval,
  get_max_texture_depth as wasmGetMaxTextureDepth,
  get_texture_depth as wasmGetTextureDepth,
  set_texture_depth as wasmSetTextureDepth,
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

  async initSimulation(width: number, height: number) {
    await waitForWasmReady();
    await wasmInitSimulation(width, height);
  },

  async startSimulationLoop() {
    await waitForWasmReady();
    wasmStartSimulationLoop();
  },

  async stopSimulationLoop() {
    await waitForWasmReady();
    wasmStopSimulationLoop();
  },

  async pauseSimulation() {
    await waitForWasmReady();
    wasmPauseSimulation();
  },

  async resumeSimulation() {
    await waitForWasmReady();
    wasmResumeSimulation();
  },

  async resetSimulation() {
    await waitForWasmReady();
    wasmResetSimulation();
  },

  async stepSimulationFrame() {
    await waitForWasmReady();
    wasmStepSimulationFrame();
  },

  async setPostUpdateInterval(frames: number) {
    await waitForWasmReady();
    wasmSetPostUpdateInterval(frames);
  },

  async getMaxTextureDepth() {
    await waitForWasmReady();
    return wasmGetMaxTextureDepth();
  },

  async getTextureDepth() {
    await waitForWasmReady();
    return wasmGetTextureDepth();
  },

  async setTextureDepth(depth: number) {
    await waitForWasmReady();
    wasmSetTextureDepth(depth);
  },
};

Comlink.expose(simulationWorkerApi);
