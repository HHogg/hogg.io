import { createContext, useContext } from 'react';
import { History, Point, Snake, Values } from './types';

export const SnakeContext = createContext<{
  history: History;
  isRunning: boolean;
  logs: string[];
  point: Point | null;
  solution: string;
  snake: Snake;
  values: Values | null;
  xLength: number;
  yLength: number;
  clearLog: () => void;
  pause: () => void;
  play: () => void;
  reset: () => void;
  stepBackwards: () => void;
  stepForwards: () => void;
}>({
  history: [],
  isRunning: false,
  logs: [],
  point: null,
  solution: '',
  snake: [],
  values: null,
  xLength: 15,
  yLength: 15,
  clearLog: () => {},
  pause: () => {},
  play: () => {},
  reset: () => {},
  stepBackwards: () => {},
  stepForwards: () => {},
});

export const useSnakeContext = () => useContext(SnakeContext);
