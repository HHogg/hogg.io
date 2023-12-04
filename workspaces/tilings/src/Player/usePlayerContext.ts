import { createContext, useContext } from 'react';
import { UsePlayerResult, defaultOptions } from './usePlayer';

const noop = () => {
  throw new Error('usePlayerContext was not initialized');
};

export const PlayerContext = createContext<UsePlayerResult>({
  ...defaultOptions,
  elapsed: 0,
  showSettings: false,
  backward: noop,
  forward: noop,
  pause: noop,
  play: noop,
  setAutoRotate: noop,
  setColorMode: noop,
  setExpansionPhases: noop,
  setScaleMode: noop,
  setScaleSize: noop,
  setShowAnnotations: noop,
  setShowDebug: noop,
  setShowSettings: noop,
  setSpeed: noop,
  toggleSettings: noop,
  toStart: noop,
  toEnd: noop,
});

export const usePlayerContext = () => useContext(PlayerContext);
