import { TypeCell } from '../types';

export default (xLength: number, yLength: number, [x, y]: TypeCell) =>
  x >= 0 && x < xLength &&
  y >= 0 && y < yLength;
