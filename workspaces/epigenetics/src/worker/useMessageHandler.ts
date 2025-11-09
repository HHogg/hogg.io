import { useCallback, useState } from 'react';
import { Message } from './types';

export type Event = {
  type: 'info' | 'success' | 'error';
  message: string;
};

export type UseMessageHandlerResult = {
  onError: (error: string) => void;
  onMessage: (message: Message) => void;
  events: Event[];
  eventsErrors: Event[];
  hasError: boolean;
  lastErrorMessage?: string;
  readyToInit: boolean;
  isWasmReady: boolean;
  isCanvasTransferred: boolean;
  isDimensionsSet: boolean;
  isSimulationInit: boolean;
  isSimulationLoopRunning: boolean;
};

export default function useMessageHandler(): UseMessageHandlerResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsErrors, setEventsErrors] = useState<Event[]>([]);
  const [isWasmReady, setIsWasmReady] = useState(false);
  const [isCanvasTransferred, setIsCanvasTransferred] = useState(false);
  const [isDimensionsSet, setIsDimensionsSet] = useState(false);
  const [isSimulationInit, setIsSimulationInit] = useState(false);
  const [isSimulationLoopRunning, setIsSimulationLoopRunning] = useState(false);

  const addEvent = useCallback((type: Event['type'], message: string) => {
    if (type === 'error') {
      setEventsErrors((prevEvents) => [...prevEvents, { type, message }]);
    }

    setEvents((prevEvents) => [...prevEvents, { type, message }]);
  }, []);

  const onError = useCallback(
    (error: string) => {
      console.error(error);
      addEvent('error', error);
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
        case 'dimensionsSet':
          setIsDimensionsSet(true);
          addEvent('success', 'Dimensions set');
          break;
        case 'simulationInit':
          setIsSimulationInit(true);
          addEvent('success', 'Simulation initialized');
          break;
        case 'simulationLoopStarted':
          setIsSimulationLoopRunning(true);
          addEvent('success', 'Simulation loop started');
          break;
        case 'simulationLoopStopped':
          setIsSimulationLoopRunning(false);
          addEvent('success', 'Simulation loop stopped');
          break;
        case 'postUpdateIntervalSet':
          addEvent('success', 'Post update interval set');
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
    isDimensionsSet &&
    !isSimulationInit &&
    !isSimulationLoopRunning &&
    !hasError;

  return {
    onError,
    onMessage,
    hasError,
    events,
    eventsErrors,
    lastErrorMessage,
    readyToInit,
    isWasmReady,
    isCanvasTransferred,
    isDimensionsSet,
    isSimulationInit,
    isSimulationLoopRunning,
  };
}
