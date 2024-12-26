import { ColorPalette, ScaleMode, Layer, ColorMode } from '@hogg/wasm';
import { createContext, useContext } from 'react';
import {
  defaultExpansionPhases,
  defaultOptions,
} from '../Renderer/defaultOptions';

export type Settings = {
  autoRotate: boolean;
  colorMode: ColorMode;
  colorPalette: ColorPalette;
  expansionPhases: number;
  scaleMode: ScaleMode;
  speed: number;
  showLayers: Record<Layer, boolean>;
};

type SettingsContextValue = Settings & {
  setAutoRotate: (autoRotate: boolean) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setColorPalette: (colorPalette: ColorPalette) => void;
  setExpansionPhases: (count: number) => void;
  setScaleMode: (scaleMode: ScaleMode) => void;
  setShowLayers: (layers: Record<Layer, boolean>) => void;
  setShowSettings: (show: boolean) => void;
  setSpeed: (speed: number) => void;
  toggleSettings: () => void;
  expansionPhases: number;
  showSettings: boolean;
};

export const defaultSettings: Settings = {
  ...defaultOptions,
  expansionPhases: defaultExpansionPhases,
  speed: 1,
};

const noop = () => {
  throw new Error('useSettingsContext was not initialized');
};

export const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  showSettings: false,
  setAutoRotate: noop,
  setColorMode: noop,
  setColorPalette: noop,
  setExpansionPhases: noop,
  setScaleMode: noop,
  setShowLayers: noop,
  setShowSettings: noop,
  setSpeed: noop,
  toggleSettings: noop,
});

export const useSettingsContext = () => useContext(SettingsContext);
