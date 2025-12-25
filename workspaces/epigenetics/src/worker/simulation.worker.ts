import * as Comlink from 'comlink';
import init, {
  transfer_canvas as wasmTransferCanvas,
  set_simulation_dimensions as wasmSetSimulationDimensions,
  init_simulation as wasmInitSimulation,
  start_simulation_loop as wasmStartSimulationLoop,
  stop_simulation_loop as wasmStopSimulationLoop,
  pause_simulation as wasmPauseSimulation,
  resume_simulation as wasmResumeSimulation,
  reset_simulation as wasmResetSimulation,
  step_simulation_frame as wasmStepSimulationFrame,
  set_post_update_interval as wasmSetPostUpdateInterval,
  set_data_config as wasmSetDataConfig,
  read_buffer_slice as wasmReadBufferSlice,
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

  async setSimulationDimensions(width: number, height: number) {
    await waitForWasmReady();
    wasmSetSimulationDimensions(width, height);
  },

  async initSimulation() {
    await waitForWasmReady();
    await wasmInitSimulation();
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

  async setDataConfig(dataConfig: unknown) {
    await waitForWasmReady();
    wasmSetDataConfig(dataConfig);
  },

  async readBufferSlice(label: string, cellIndex: number) {
    await waitForWasmReady();
    wasmReadBufferSlice(label, cellIndex);
  },
};

Comlink.expose(simulationWorkerApi);
