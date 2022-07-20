import { TypeCell } from '../types';
import isCellEqual from './isCellEqual';

export default (set: TypeCell[], a: TypeCell) =>
  set.some((b) => isCellEqual(a, b));
