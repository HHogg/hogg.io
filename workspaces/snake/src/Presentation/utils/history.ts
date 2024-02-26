import { HistoryBlock, Cell, History } from '../types';
import { createHistoryBlock } from './historyBlock';
import isCellEqual from './isCellEqual';

const manipulateHistory = (
  history: History,
  n: number,
  predicate: (block: HistoryBlock) => null | HistoryBlock
): History => {
  const entry = predicate(history[n]);

  return entry
    ? [...history.slice(0, n), entry, ...history.slice(n + 1)]
    : [...history.slice(0, n), ...history.slice(n + 1)];
};

export const createBlock = (xSize: number, ySize: number, history: History) =>
  manipulateHistory(history, history.length, () =>
    createHistoryBlock(
      xSize,
      ySize,
      history[history.length - 1] && history[history.length - 1].snake
    )
  );

export const moveForwards = (
  history: History,
  xSize: number,
  ySize: number,
  cell: Cell
) => {
  const { point, snake } = history[history.length - 1];

  if (point && isCellEqual(cell, point)) {
    return manipulateHistory(history, history.length, () =>
      createHistoryBlock(xSize, ySize, [point, ...snake])
    );
  }

  return manipulateHistory(
    history,
    history.length - 1,
    ({ path, point, snake }) => ({
      path: [snake.slice(-1)[0], ...path],
      point: point,
      snake: [cell, ...snake].slice(0, -1),
    })
  );
};

export const moveBackwards = (history: History) => {
  return manipulateHistory(
    history,
    history.length - 1,
    ({ path, point, snake }) =>
      path.length === 0
        ? null
        : {
            path: path.slice(1),
            point: point,
            snake: [...snake.slice(1), path[0]],
          }
  );
};
