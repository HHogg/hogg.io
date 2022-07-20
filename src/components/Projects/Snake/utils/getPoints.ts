import { TypeHistory } from '../types';
import getCompletedHistory from './getCompletedHistory';

export default (history: TypeHistory) => {
  return getCompletedHistory(history).length;
};
