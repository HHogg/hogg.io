import { createContext, useContext } from 'react';
import { ColorMode, Layer, ScaleMode } from '../../types';
import {
  defaultExpansionPhases,
  defaultOptions,
} from '../Renderer/defaultOptions';

export type Settings = {
  autoRotate: boolean;
  colorMode: ColorMode;
  expansionPhases: number;
  scaleMode: ScaleMode;
  scaleSize: number;
  showLayers: Record<Layer, boolean>;
};

export type SettingsContextValue = Settings & {
  setAutoRotate: (autoRotate: boolean) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setExpansionPhases: (count: number) => void;
  setScaleMode: (scaleMode: ScaleMode) => void;
  setScaleSize: (scaleSize: number) => void;
  setShowLayers: (layers: Record<Layer, boolean>) => void;
  setShowSettings: (show: boolean) => void;
  toggleSettings: () => void;
  expansionPhases: number;
  showSettings: boolean;
};

export const defaultSettings: Settings = {
  ...defaultOptions,
  expansionPhases: defaultExpansionPhases,
};

const noop = () => {
  throw new Error('useSettingsContext was not initialized');
};

export const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  showSettings: false,
  setAutoRotate: noop,
  setColorMode: noop,
  setExpansionPhases: noop,
  setScaleMode: noop,
  setScaleSize: noop,
  setShowLayers: noop,
  setShowSettings: noop,
  toggleSettings: noop,
});

export const useSettingsContext = () => useContext(SettingsContext);
