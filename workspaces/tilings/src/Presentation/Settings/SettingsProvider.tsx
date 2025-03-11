import {
  ColorMode,
  ColorPalette,
  FeatureToggle,
  Layer,
  ScaleMode,
} from '@hogg/wasm';
import { PropsWithChildren, useState } from 'react';
import {
  Settings,
  SettingsContext,
  defaultSettings,
} from './useSettingsContext';
import useVersionedSettings from './useVersionedSettings';

type SettingsProviderProps = {
  settings?: Partial<Settings>;
  onReset?: () => void;
};

export default function SettingsProvider({
  settings: settingsProps,
  onReset,
  ...rest
}: PropsWithChildren<SettingsProviderProps>) {
  const [settings, setSettings] = useVersionedSettings(settingsProps);

  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = () => setShowSettings(!showSettings);

  const setAutoRotate = (autoRotate: boolean) =>
    setSettings({ ...settings, autoRotate });

  const setColorMode = (colorMode: ColorMode) =>
    setSettings({ ...settings, colorMode });

  const setColorPalette = (colorPalette: ColorPalette) =>
    setSettings({ ...settings, colorPalette });

  const setRepetitions = (repetitions: number) =>
    setSettings({ ...settings, repetitions });

  const setFeatureToggles = (featureToggles: Record<FeatureToggle, boolean>) =>
    setSettings({ ...settings, featureToggles });

  const setScaleMode = (scaleMode: ScaleMode) =>
    setSettings({ ...settings, scaleMode });

  const setShowLayers = (showLayers: Record<Layer, boolean>) =>
    setSettings({ ...settings, showLayers });

  const setSpeed = (speed: number) => setSettings({ ...settings, speed });

  const resetAllSettings = () => {
    setSettings({ ...defaultSettings, ...settingsProps });

    if (onReset) {
      onReset();
    }
  };

  const value = {
    ...settings,
    setAutoRotate,
    setColorMode,
    setColorPalette,
    setRepetitions,
    setFeatureToggles,
    setScaleMode,
    setShowLayers,
    setSpeed,
    setShowSettings,
    resetAllSettings,
    toggleSettings,
    elapsed: 0,
    showSettings,
  };

  return <SettingsContext.Provider {...rest} value={value} />;
}
