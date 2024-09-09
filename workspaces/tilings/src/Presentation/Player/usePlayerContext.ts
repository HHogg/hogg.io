import { createContext, useContext } from 'react';
import { UsePlayerResult, defaultOptions } from './usePlayer';

const noop = () => {
  throw new Error('usePlayerContext was not initialized');
};

const initialContext = {
  ...defaultOptions,
  elapsed: 0,
  backward: noop,
  forward: noop,
  pause: noop,
  play: noop,
  setSpeed: noop,
  toStart: noop,
  toEnd: noop,
};

export const PlayerContext = createContext<UsePlayerResult>(initialContext);

export const usePlayerContext = (enabled = true): UsePlayerResult => {
  const context = useContext(PlayerContext);
  return enabled ? context : initialContext;
};
