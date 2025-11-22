import { useCallback, useEffect, useState } from 'react';
import {
  getSimulationWorker as getSimulationWorkerRaw,
  SimulationWorkerApi,
  terminateSimulationWorker,
} from './simulationWorker';
import { Message } from './types';

export type Event = {
  type: 'info' | 'success' | 'error';
  message: string;
};

export type UseSimulationWorkerResult = {
  getSimulationWorker: () => SimulationWorkerApi;
  initSimulation: () => Promise<void>;
  events: Event[];
  eventsErrors: Event[];
  hasError: boolean;
  lastErrorMessage?: string;
  readyToInit: boolean;
  isWasmReady: boolean;
  isCanvasTransferred: boolean;
  isInitializing: boolean;
  isInitialized: boolean;
  isLoopRunning: boolean;
  isPaused: boolean;
};

export default function useSimulationWorker(
  width: number,
  height: number
): UseSimulationWorkerResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsErrors, setEventsErrors] = useState<Event[]>([]);
  const [isWasmReady, setIsWasmReady] = useState(false);
  const [isCanvasTransferred, setIsCanvasTransferred] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoopRunning, setIsLoopRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const addEvent = useCallback((type: Event['type'], message: string) => {
    if (type === 'error') {
      setEventsErrors((prevEvents) => [...prevEvents, { type, message }]);
    }

    setEvents((prevEvents) => [...prevEvents, { type, message }]);
  }, []);

  const onError = useCallback(
    (error: string | Error | unknown) => {
      // Normalize error to string
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : String(error || 'Unknown error');
      console.error(errorMessage);
      addEvent('error', errorMessage);
    },
    [addEvent]
  );

  const onMessage = useCallback(
    (message: Message) => {
      switch (message.name) {
        case 'wasmReady':
          setIsWasmReady(true);
          addEvent('success', 'Wasm ready');
          break;
        case 'canvasTransferred':
          setIsCanvasTransferred(true);
          addEvent('success', 'Canvas transferred');
          break;
        case 'simulationInit':
          setIsInitialized(true);
          addEvent('success', 'Simulation initialized');
          break;
        case 'simulationLoopStarted':
          setIsLoopRunning(true);
          addEvent('success', 'Simulation loop started');
          break;
        case 'simulationLoopStopped':
          setIsLoopRunning(false);
          setIsPaused(false);
          addEvent('success', 'Simulation loop stopped');
          break;
        case 'simulationPaused':
          setIsPaused(true);
          addEvent('success', 'Simulation paused');
          break;
        case 'simulationResumed':
          setIsPaused(false);
          addEvent('success', 'Simulation resumed');
          break;
        case 'simulationReset':
          addEvent('success', 'Simulation reset');
          break;
        case 'postUpdateIntervalSet':
          addEvent('success', 'Post update interval set');
          break;
        case 'textureDepthSet':
          addEvent('success', `Texture depth set to ${message.data}`);
          break;
        case 'error':
          addEvent('error', message.data);
          break;
        case 'log':
          addEvent('info', message.data);
          break;
      }
    },
    [addEvent]
  );

  const lastErrorMessage = eventsErrors[eventsErrors.length - 1]?.message;
  const hasError = eventsErrors.length > 0;

  const readyToInit =
    isWasmReady &&
    isCanvasTransferred &&
    !isInitializing &&
    !isInitialized &&
    !isLoopRunning &&
    !hasError;

  const getSimulationWorker = useCallback(() => {
    return getSimulationWorkerRaw(onError, onMessage);
  }, [onError, onMessage]);

  const initSimulation = useCallback(async () => {
    setIsInitializing(true);
    const simulationWorker = getSimulationWorker();
    await simulationWorker.initSimulation(width, height);
    setIsInitializing(false);
  }, [getSimulationWorker, width, height]);

  useEffect(() => {
    getSimulationWorker();

    return () => {
      try {
        terminateSimulationWorker();
      } catch (err) {
        onError(err);
      }
    };
  }, [getSimulationWorker, onError]);

  return {
    getSimulationWorker,
    initSimulation,
    hasError,
    events,
    eventsErrors,
    lastErrorMessage,
    readyToInit,
    isWasmReady,
    isCanvasTransferred,
    isInitializing,
    isInitialized,
    isLoopRunning,
    isPaused,
  };
}
