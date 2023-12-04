import { History } from '../types';
import getCompletedHistory from './getCompletedHistory';
import getMean from './getMean';

export default function getAverage(history: History) {
  return getMean(getCompletedHistory(history).map(({ path }) => path.length));
}
