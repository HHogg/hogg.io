import { TypeCell } from '../types';

export default (a: TypeCell, b: TypeCell) => {
  return a[0] === b[0] && a[1] === b[1];
};
