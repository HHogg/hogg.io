import { TypeCell, TypeSnake } from '../types';
import isCellInbounds from './isCellInbounds';
import isCellIncluded from './isCellIncluded';

export default (xLength: number, yLength: number, snake: TypeSnake) => {
  const cells: TypeCell[] = [
    [snake[0][0], snake[0][1] - 1],
    [snake[0][0] + 1, snake[0][1]],
    [snake[0][0], snake[0][1] + 1],
    [snake[0][0] - 1, snake[0][1]],
  ];

  return cells.filter((cell) => isCellInbounds(xLength, yLength, cell) &&
    !isCellIncluded(snake.slice(0, -1), cell));
};
