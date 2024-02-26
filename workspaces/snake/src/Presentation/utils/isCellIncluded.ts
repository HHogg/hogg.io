import { Cell } from '../types';
import isCellEqual from './isCellEqual';

export default function isCellIncluded(set: Cell[], a: Cell) {
  return set.some((b) => isCellEqual(a, b));
}
