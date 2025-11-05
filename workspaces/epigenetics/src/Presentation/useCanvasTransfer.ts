import * as Comlink from 'comlink';
import { useEffect } from 'react';
import { devError } from '../devLog';
import { getSimulationWorker } from '../workers/simulationWorker';

interface UseCanvasTransferOptions {
  width: number;
  height: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isTransferred: React.MutableRefObject<boolean>;
  sharedBuffer: SharedArrayBuffer | null;
}

export function useCanvasTransfer({
  width,
  height,
  canvasRef,
  isTransferred,
  sharedBuffer,
}: UseCanvasTransferOptions) {
  // Transfer canvas to render worker when ready
  // The render loop will auto-start in the worker when both canvas and buffer are initialized
  useEffect(() => {
    const transferCanvas = async () => {
      if (
        canvasRef.current &&
        !isTransferred.current &&
        width > 0 &&
        height > 0 &&
        sharedBuffer
      ) {
        try {
          const simulationWorker = getSimulationWorker();
          const offscreenCanvas =
            canvasRef.current.transferControlToOffscreen();
          isTransferred.current = true;

          // Set canvas size
          const scaledWidth = width * window.devicePixelRatio;
          const scaledHeight = height * window.devicePixelRatio;
          offscreenCanvas.width = scaledWidth;
          offscreenCanvas.height = scaledHeight;

          // Explicitly transfer OffscreenCanvas to the worker
          // This will auto-start the simulation loop if buffer and dimensions are already initialized
          await simulationWorker.initCanvas(
            Comlink.transfer(offscreenCanvas, [offscreenCanvas])
          );
        } catch (err) {
          devError('Failed to transfer canvas:', err);
        }
      }
    };

    transferCanvas();

    return () => {
      // Stop the simulation loop when component unmounts or dependencies change
      getSimulationWorker()
        .stopLoop()
        .catch((err) => {
          devError('Failed to stop simulation loop:', err);
        });
    };
  }, [width, height, canvasRef, isTransferred, sharedBuffer]);
}
