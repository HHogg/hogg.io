import { History } from '../types';
import isCellEqual from './isCellEqual';

export default function getCompletedHistory(history: History) {
  const final = history[history.length - 1];

  if (final && final.point && isCellEqual(final.snake[0], final.point)) {
    return history;
  }

  return history.slice(0, -1);
}
