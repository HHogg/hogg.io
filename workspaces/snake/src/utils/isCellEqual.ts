import { Cell } from '../types';

export default function isCellEqual(a: Cell, b: Cell) {
  return a[0] === b[0] && a[1] === b[1];
}
