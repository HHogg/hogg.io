import { useEffect } from 'react';
import { devLog, devError } from '../devLog';
import { getSimulationWorker } from '../workers/simulationWorker';

interface UseCanvasDimensionsOptions {
  width: number;
  height: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isTransferred: React.MutableRefObject<boolean>;
}

export function useCanvasDimensions({
  width,
  height,
  canvasRef,
  isTransferred,
}: UseCanvasDimensionsOptions) {
  // Update canvas dimensions when size changes
  // This also sets dimensions in the compute worker, which will auto-start the compute loop
  useEffect(() => {
    if (canvasRef.current && isTransferred.current && width > 0 && height > 0) {
      const updateCanvasSize = async () => {
        try {
          const scaledWidth = width * window.devicePixelRatio;
          const scaledHeight = height * window.devicePixelRatio;

          // Set dimensions in simulation worker (this will auto-start the simulation loop if buffer and canvas are ready)
          const simulationWorker = getSimulationWorker();
          await simulationWorker.setDimensions(scaledWidth, scaledHeight);

          devLog('Canvas size changed:', scaledWidth, scaledHeight);
        } catch (err) {
          devError('Failed to update canvas size:', err);
        }
      };

      updateCanvasSize();
    }
  }, [width, height, canvasRef, isTransferred]);
}
