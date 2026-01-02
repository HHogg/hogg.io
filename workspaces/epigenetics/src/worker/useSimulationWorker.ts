import { useCallback, useEffect, useState, useRef } from 'react';
import {
  getSimulationWorker as getSimulationWorkerRaw,
  SimulationWorkerApi,
  terminateSimulationWorker,
} from './simulationWorker';
import {
  Message,
  Config as DataConfig,
  RunStats,
  DataBufferReadContent,
} from './types.generated';

export type Event = {
  type: 'info' | 'success' | 'error';
  message: string;
};

export type UseSimulationWorkerResult = {
  getSimulationWorker: () => SimulationWorkerApi;
  initSimulation: () => Promise<void>;
  readBufferSlice: (label: string, cellIndex: number) => Promise<void>;
  updateDataConfig: (dataConfig: Partial<DataConfig>) => void;
  dataConfig: DataConfig | null;
  estimatedMemoryUsage: string | null;
  events: Event[];
  eventsErrors: Event[];
  runStats: RunStats | null;
  hasError: boolean;
  lastErrorMessage?: string;
  readyToInit: boolean;
  isWasmReady: boolean;
  isCanvasTransferred: boolean;
  isInitializing: boolean;
  isInitialized: boolean;
  isLoopRunning: boolean;
  isPaused: boolean;
  bufferReadResults: Record<number, Record<string, DataBufferReadContent>>;
};

export default function useSimulationWorker(
  width: number,
  height: number
): UseSimulationWorkerResult {
  const [runStats, setRunStats] = useState<RunStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsErrors, setEventsErrors] = useState<Event[]>([]);
  const [dataConfig, setDataConfig] = useState<DataConfig | null>(null);
  const [localDataConfig, setLocalDataConfig] = useState<DataConfig | null>(
    null
  );
  const [estimatedMemoryUsage, setEstimatedMemoryUsage] = useState<
    string | null
  >(null);
  const [isWasmReady, setIsWasmReady] = useState(false);
  const [isCanvasTransferred, setIsCanvasTransferred] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoopRunning, setIsLoopRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [bufferReadResults, setBufferReadResults] = useState<
    Record<number, Record<string, DataBufferReadContent>>
  >({});

  const updateDataConfigTimeoutRef = useRef<number | null>(null);
  const updateDataConfigPendingUpdatesRef = useRef<Partial<DataConfig>>({});
  const localDataConfigRef = useRef<DataConfig | null>(localDataConfig);

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
          setIsInitialized(false);
          setRunStats(null);
          break;
        case 'simulationRunStats':
          setRunStats(message.data);
          break;
        case 'postUpdateIntervalSet':
          addEvent('success', 'Post update interval set');
          break;
        case 'dataConfigSet':
          setDataConfig(message.data);
          setLocalDataConfig(message.data);
          addEvent('success', 'Data config updated');
          break;
        case 'dataMemoryUsageEstimated':
          setEstimatedMemoryUsage(message.data);
          addEvent('info', `Estimated memory usage: ${message.data}`);
          break;
        case 'dataBufferRead':
          setBufferReadResults((prev) => {
            const cellIndex = message.data.cellIndex;
            const cellData = prev[cellIndex] || {};
            return {
              ...prev,
              [cellIndex]: {
                ...cellData,
                [message.data.label]: message.data,
              },
            };
          });
          addEvent(
            'info',
            `Buffer read for cell ${message.data.cellIndex}: ${message.data.label}`
          );
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
    await simulationWorker.initSimulation();
    setIsInitializing(false);
  }, [getSimulationWorker]);

  const readBufferSlice = useCallback(
    async (label: string, cellIndex: number) => {
      const simulationWorker = getSimulationWorker();
      await simulationWorker.readBufferSlice(label, cellIndex);
    },
    [getSimulationWorker]
  );

  // Sync localDataConfig with dataConfig when it updates from worker
  useEffect(() => {
    if (dataConfig) {
      setLocalDataConfig(dataConfig);
    }
  }, [dataConfig]);

  // Keep ref in sync with localDataConfig state
  useEffect(() => {
    localDataConfigRef.current = localDataConfig;
  }, [localDataConfig]);

  const updateDataConfig = useCallback(
    (updates: Partial<DataConfig>) => {
      if (!localDataConfigRef.current) {
        return;
      }

      // Update local state immediately for responsive UI
      const newLocalConfig: DataConfig = {
        ...localDataConfigRef.current,
        ...updates,
      };
      setLocalDataConfig(newLocalConfig);

      // Accumulate updates for debounced worker update
      updateDataConfigPendingUpdatesRef.current = {
        ...updateDataConfigPendingUpdatesRef.current,
        ...updates,
      };

      // Clear existing timeout
      if (updateDataConfigTimeoutRef.current !== null) {
        clearTimeout(updateDataConfigTimeoutRef.current);
      }

      // Set new timeout to apply updates after delay
      updateDataConfigTimeoutRef.current = window.setTimeout(async () => {
        const currentConfig = localDataConfigRef.current;
        if (!currentConfig) {
          updateDataConfigPendingUpdatesRef.current = {};
          updateDataConfigTimeoutRef.current = null;
          return;
        }

        const simulationWorker = getSimulationWorker();
        const mergedConfig: DataConfig = {
          ...currentConfig,
          ...updateDataConfigPendingUpdatesRef.current,
        };
        await simulationWorker.setDataConfig(mergedConfig);
        updateDataConfigPendingUpdatesRef.current = {};
        updateDataConfigTimeoutRef.current = null;
      }, 300);
    },
    [getSimulationWorker]
  );

  useEffect(() => {
    getSimulationWorker();

    return () => {
      // Clear debounce timeout on unmount
      if (updateDataConfigTimeoutRef.current !== null) {
        clearTimeout(updateDataConfigTimeoutRef.current);
      }

      try {
        terminateSimulationWorker();
      } catch (err) {
        onError(err);
      }
    };
  }, [getSimulationWorker, onError]);

  useEffect(() => {
    if (!isWasmReady || !width || !height) {
      return;
    }

    const updateDimensions = async () => {
      const worker = getSimulationWorker();
      await worker.setSimulationDimensions(width, height);
    };

    updateDimensions();
  }, [width, height, isWasmReady, getSimulationWorker]);

  return {
    getSimulationWorker,
    initSimulation,
    readBufferSlice,
    updateDataConfig,
    dataConfig: localDataConfig,
    estimatedMemoryUsage,
    hasError,
    runStats,
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
    bufferReadResults,
  };
}
