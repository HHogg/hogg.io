import { ColorPalette, ScaleMode, Layer } from '@hogg/wasm';
import { createContext, useContext } from 'react';
import {
  defaultExpansionPhases,
  defaultOptions,
} from '../Renderer/defaultOptions';

export type Settings = {
  autoRotate: boolean;
  colorPalette: ColorPalette;
  expansionPhases: number;
  scaleMode: ScaleMode;
  showLayers: Record<Layer, boolean>;
};

type SettingsContextValue = Settings & {
  setAutoRotate: (autoRotate: boolean) => void;
  setColorPalette: (colorPalette: ColorPalette) => void;
  setExpansionPhases: (count: number) => void;
  setScaleMode: (scaleMode: ScaleMode) => void;
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
  setColorPalette: noop,
  setExpansionPhases: noop,
  setScaleMode: noop,
  setShowLayers: noop,
  setShowSettings: noop,
  toggleSettings: noop,
});

export const useSettingsContext = () => useContext(SettingsContext);
