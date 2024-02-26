import { HistoryBlock, Cell, Snake } from '../types';
import isCellIncluded from './isCellIncluded';

const createSnake = (xLength: number, yLength: number): Snake =>
  Array.from({ length: 4 }, (_, i) => [
    Math.floor(xLength / 2) - i,
    Math.floor(yLength / 2),
  ]);

const createPoint = (
  xLength: number,
  yLength: number,
  snake: Snake
): Cell | null => {
  const freeGrid = Array.from({ length: xLength * yLength })
    .map<[number, number]>((_, i) => [i % xLength, Math.floor(i / yLength)])
    .filter((cell) => !isCellIncluded(snake, cell));

  return freeGrid.length
    ? freeGrid[Math.floor(Math.random() * (freeGrid.length - 1))]
    : null;
};

export const createHistoryBlock = (
  xLength: number,
  yLength: number,
  snake: Snake = createSnake(xLength, yLength)
): HistoryBlock => {
  return {
    path: [],
    point: createPoint(xLength, yLength, snake),
    snake: snake,
  };
};
