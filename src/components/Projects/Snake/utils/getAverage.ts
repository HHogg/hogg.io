import { TypeHistory } from '../types';
import getCompletedHistory from './getCompletedHistory';
import getMean from './getMean';

export default (history: TypeHistory) =>
  getMean(getCompletedHistory(history).map(({ path }) => path.length));
