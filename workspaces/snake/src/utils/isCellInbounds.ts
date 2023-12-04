import { Cell } from '../types';

export default function isCellInBounds(
  xLength: number,
  yLength: number,
  [x, y]: Cell
) {
  return x >= 0 && x < xLength && y >= 0 && y < yLength;
}
