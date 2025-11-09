import { useCallback, useState } from 'react';
import { getSimulationWorker } from './simulationWorker';
import { UseMessageHandlerResult } from './useMessageHandler';

export function useInitSimulation({
  hasError,
  readyToInit,
  onError,
  onMessage,
}: UseMessageHandlerResult) {
  const [isInitializing, setIsInitializing] = useState(false);

  const initSimulation = useCallback(async () => {
    if (hasError || !readyToInit || isInitializing) {
      return;
    }

    setIsInitializing(true);

    try {
      const simulationWorker = getSimulationWorker(onError, onMessage);
      await simulationWorker.initSimulation();
    } catch (error) {
      onError(error as string);
    }

    setIsInitializing(false);
  }, [hasError, isInitializing, onError, onMessage, readyToInit]);

  return {
    isInitializing,
    initSimulation,
  };
}
