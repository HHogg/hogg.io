import {
  ColorPalette,
  ScaleMode,
  Layer,
  ColorMode,
  FeatureToggle,
} from '@hogg/wasm';
import { createContext, useContext } from 'react';
import {
  defaultExpansionPhases,
  defaultFeatureToggles,
  defaultOptions,
} from '../Renderer/defaultOptions';

export type Settings = {
  autoRotate: boolean;
  colorMode: ColorMode;
  colorPalette: ColorPalette;
  expansionPhases: number;
  featureToggles: Record<FeatureToggle, boolean>;
  scaleMode: ScaleMode;
  speed: number;
  showLayers: Record<Layer, boolean>;
};

type SettingsContextValue = Settings & {
  setAutoRotate: (autoRotate: boolean) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setColorPalette: (colorPalette: ColorPalette) => void;
  setExpansionPhases: (count: number) => void;
  setFeatureToggles: (featureToggles: Record<FeatureToggle, boolean>) => void;
  setScaleMode: (scaleMode: ScaleMode) => void;
  setShowLayers: (layers: Record<Layer, boolean>) => void;
  setShowSettings: (show: boolean) => void;
  setSpeed: (speed: number) => void;
  resetAllSettings: () => void;
  toggleSettings: () => void;
  expansionPhases: number;
  showSettings: boolean;
};

export const defaultSettings: Settings = {
  ...defaultOptions,
  expansionPhases: defaultExpansionPhases,
  featureToggles: defaultFeatureToggles,
  speed: 2,
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
  setFeatureToggles: noop,
  setScaleMode: noop,
  setShowLayers: noop,
  setShowSettings: noop,
  setSpeed: noop,
  resetAllSettings: noop,
  toggleSettings: noop,
});

export const useSettingsContext = () => useContext(SettingsContext);
