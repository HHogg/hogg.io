import * as Comlink from 'comlink';
import { useEffect, useRef } from 'react';
import { UseSimulationWorkerResult } from './useSimulationWorker';

export function useCanvasTransfer(
  canvas: HTMLCanvasElement | null,
  { hasError, getSimulationWorker }: UseSimulationWorkerResult
) {
  const refTransferred = useRef<boolean>(false);

  // Transfer canvas to render worker when ready
  // The render loop will auto-start in the worker when both canvas and buffer are initialized
  useEffect(() => {
    if (!canvas || hasError || refTransferred.current) {
      return;
    }

    let isTransferring = false;

    const transferCanvas = async () => {
      // Guard against multiple simultaneous transfers
      if (refTransferred.current || isTransferring) {
        return;
      }

      // Set flag to prevent multiple simultaneous transfers
      isTransferring = true;

      try {
        refTransferred.current = true;

        const simulationWorker = getSimulationWorker();
        const offscreenCanvas = canvas.transferControlToOffscreen();

        // Transfer OffscreenCanvas to the worker
        await simulationWorker.transferCanvas(
          Comlink.transfer(offscreenCanvas, [offscreenCanvas])
        );
      } catch (err) {
        // Error handling is done by the worker's onError callback
        // Reset flag on error so we can retry
        refTransferred.current = false;
      } finally {
        isTransferring = false;
      }
    };

    transferCanvas();
  }, [canvas, hasError, refTransferred, getSimulationWorker]);
}
