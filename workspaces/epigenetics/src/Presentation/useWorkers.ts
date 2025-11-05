import { useEffect, useRef } from 'react';
import { devLog, devError } from '../devLog';
import {
  getSimulationWorker,
  terminateSimulationWorker,
} from '../workers/simulationWorker';

interface UseWorkersOptions {
  onError: (error: string) => void;
}

export function useWorkers({ onError }: UseWorkersOptions) {
  const sharedBufferRef = useRef<SharedArrayBuffer | null>(null);

  useEffect(() => {
    const initWorkers = async () => {
      try {
        // Check if SharedArrayBuffer is available
        if (typeof SharedArrayBuffer === 'undefined') {
          throw new Error(
            'SharedArrayBuffer is not available. This requires Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy headers to be set. Please ensure the development server is configured correctly.'
          );
        }

        // Create shared array buffer for shader data
        // For a 4K display at device pixel ratio 2, we need:
        // 3840 * 2 * 2160 * 2 * 4 bytes = ~132MB
        // Let's use 256MB to be safe
        const bufferSize = 256 * 1024 * 1024;
        const sharedBuffer = new SharedArrayBuffer(bufferSize);
        sharedBufferRef.current = sharedBuffer;

        // Initialize simulation worker
        const simulationWorker = getSimulationWorker();
        await simulationWorker.init();
        await simulationWorker.initSharedBuffer(sharedBuffer);

        // Optionally configure update interval (default is 30 frames)
        // await simulationWorker.setUpdateInterval(30);

        devLog('Simulation worker initialized successfully');
      } catch (err) {
        const errorMessage = (err as Error).message;
        onError(errorMessage);
        devError('Failed to initialize workers:', err);
      }
    };

    initWorkers();

    return () => {
      terminateSimulationWorker();
    };
  }, [onError]);

  return sharedBufferRef.current;
}
