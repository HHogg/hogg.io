import { createContext, useContext } from 'react';
import { TypeHistory, TypePoint, TypeSnake, TypeValues } from './types';

export const SnakeContext = createContext<{
  history: TypeHistory;
  isStarted: boolean;
  isRunning: boolean;
  logs: string[];
  onClearLog: () => void;
  onPause: () => void;
  onPlay: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onStart: () => void;
  onStepBackwards: () => void;
  onStepForwards: () => void;
  point: undefined | TypePoint;
  snake: undefined | TypeSnake;
  values: undefined | TypeValues;
  xLength: number;
  yLength: number;
}>({
  history: [],
  isStarted: false,
  isRunning: false,
  logs: [],
  onClearLog: () => {},
  onPause: () => {},
  onPlay: () => {},
  onRefresh: () => {},
  onReset: () => {},
  onStart: () => {},
  onStepBackwards: () => {},
  onStepForwards: () => {},
  point: undefined,
  snake: undefined,
  values: undefined,
  xLength: 15,
  yLength: 15,
});

export const useSnakeContext = () => useContext(SnakeContext);
