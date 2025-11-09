import { useEffect } from 'react';
import { getSimulationWorker } from './simulationWorker';
import { UseMessageHandlerResult } from './useMessageHandler';

export function useCanvasDimensions(
  width: number,
  height: number,
  { hasError, onError, onMessage }: UseMessageHandlerResult
) {
  useEffect(() => {
    if (width > 0 && height > 0 && !hasError) {
      const updateCanvasSize = async () => {
        try {
          const simulationWorker = getSimulationWorker(onError, onMessage);
          await simulationWorker.refreshDimensions(
            width * window.devicePixelRatio,
            height * window.devicePixelRatio
          );
        } catch (err) {
          onError((err as Error).message);
        }
      };

      updateCanvasSize();
    }
  }, [width, height, hasError, onError, onMessage]);
}
