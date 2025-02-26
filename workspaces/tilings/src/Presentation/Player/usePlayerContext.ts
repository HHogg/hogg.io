import { createContext, useContext } from 'react';
import { UsePlayerResult } from './usePlayer';

const noop = () => {
  // throw new Error('usePlayerContext was not initialized');
};

const initialContext: UsePlayerResult = {
  backward: noop,
  forward: noop,
  pause: noop,
  play: noop,
  toStart: noop,
  toEnd: noop,
  reset: noop,
  updateNotation: noop,
  uid: '',
  error: undefined,
  percent: 0,
  renderMetrics: null,
  renderResult: null,
  snapshot: {
    drawIndex: 0,
    intervalMs: 0,
    isPlaying: false,
    isLooping: false,
    maxIndex: 0,
  },
};

export const PlayerContext = createContext<UsePlayerResult>(initialContext);

export const usePlayerContext = (): UsePlayerResult => {
  return useContext(PlayerContext);
};
