import { createContext, useContext } from 'react';
import { UsePlayerResult, defaultOptions } from './usePlayer';

const noop = () => {
  throw new Error('usePlayerContext was not initialized');
};

export const PlayerContext = createContext<UsePlayerResult>({
  ...defaultOptions,
  elapsed: 0,
  backward: noop,
  forward: noop,
  pause: noop,
  play: noop,
  setSpeed: noop,
  toStart: noop,
  toEnd: noop,
  fullScreenEnter: noop,
  fullScreenExit: noop,
});

export const usePlayerContext = () => useContext(PlayerContext);
