import {
  ColorPalette,
  ScaleMode,
  Layer,
  ColorMode,
  FeatureToggle,
} from '@hogg/wasm';
import { createContext, useContext } from 'react';
import {
  defaultRepetitions,
  defaultFeatureToggles,
  defaultOptions,
} from '../Renderer/defaultOptions';

export type Settings = {
  autoRotate: boolean;
  colorMode: ColorMode;
  colorPalette: ColorPalette;
  featureToggles: Record<FeatureToggle, boolean>;
  repetitions: number;
  scaleMode: ScaleMode;
  showLayers: Record<Layer, boolean>;
  speed: number;
};

type SettingsContextValue = Settings & {
  repetitions: number;
  resetAllSettings: () => void;
  setAutoRotate: (autoRotate: boolean) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setColorPalette: (colorPalette: ColorPalette) => void;
  setFeatureToggles: (featureToggles: Record<FeatureToggle, boolean>) => void;
  setRepetitions: (count: number) => void;
  setScaleMode: (scaleMode: ScaleMode) => void;
  setShowLayers: (layers: Record<Layer, boolean>) => void;
  setShowSettings: (show: boolean) => void;
  setSpeed: (speed: number) => void;
  showSettings: boolean;
  toggleSettings: () => void;
};

export const defaultSettings: Settings = {
  ...defaultOptions,
  repetitions: defaultRepetitions,
  featureToggles: defaultFeatureToggles,
  speed: 2,
};

const noop = () => {
  throw new Error('useSettingsContext was not initialized');
};

export const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  resetAllSettings: noop,
  setAutoRotate: noop,
  setColorMode: noop,
  setColorPalette: noop,
  setFeatureToggles: noop,
  setRepetitions: noop,
  setScaleMode: noop,
  setShowLayers: noop,
  setShowSettings: noop,
  setSpeed: noop,
  showSettings: false,
  toggleSettings: noop,
});

export const useSettingsContext = () => useContext(SettingsContext);
