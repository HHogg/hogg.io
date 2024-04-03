import { createContext, useContext } from 'react';
import { Annotation, ColorMode, ScaleMode } from '../../types';

export type Settings = {
  autoRotate: boolean;
  colorMode: ColorMode;
  expansionPhases: number;
  scaleMode: ScaleMode;
  scaleSize: number;
  showAnnotations: Record<Annotation, boolean>;
  showDebug: boolean;
};

export type SettingsContextValue = Settings & {
  setAutoRotate: (autoRotate: boolean) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setExpansionPhases: (count: number) => void;
  setScaleMode: (scaleMode: ScaleMode) => void;
  setScaleSize: (scaleSize: number) => void;
  setShowAnnotations: (annotations: Record<Annotation, boolean>) => void;
  setShowDebug: (debug: boolean) => void;
  setShowSettings: (show: boolean) => void;
  toggleSettings: () => void;
  expansionPhases: number;
  showSettings: boolean;
};

export const defaultOptions: Settings = {
  autoRotate: false,
  colorMode: ColorMode.VaporWaveRandom,
  expansionPhases: 3,
  scaleMode: ScaleMode.WithinBounds,
  scaleSize: 20,
  showAnnotations: {
    [Annotation.AxisOrigin]: false,
    [Annotation.Transform]: false,
    [Annotation.VertexType]: false,
  },
  showDebug: false,
};

const noop = () => {
  throw new Error('useSettingsContext was not initialized');
};

export const SettingsContext = createContext<SettingsContextValue>({
  ...defaultOptions,
  showSettings: false,
  setAutoRotate: noop,
  setColorMode: noop,
  setExpansionPhases: noop,
  setScaleMode: noop,
  setScaleSize: noop,
  setShowAnnotations: noop,
  setShowDebug: noop,
  setShowSettings: noop,
  toggleSettings: noop,
});

export const useSettingsContext = () => useContext(SettingsContext);
