import { useEffect } from 'react';
import { terminateSimulationWorker } from './simulationWorker';
import { UseMessageHandlerResult } from './useMessageHandler';

export function useTerminateWorker({ onError }: UseMessageHandlerResult) {
  useEffect(() => {
    return () => {
      try {
        terminateSimulationWorker();
      } catch (err) {
        onError((err as Error).message);
      }
    };
  }, [onError]);
}
