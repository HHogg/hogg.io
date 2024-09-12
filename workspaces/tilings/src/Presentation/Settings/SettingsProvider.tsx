import { PropsWithChildren, useState } from 'react';
import { ColorMode, ScaleMode } from '../../types';
import {
  Settings,
  SettingsContext,
  defaultSettings,
} from './useSettingsContext';

export type SettingsProviderProps = {
  settings?: Partial<Settings>;
};

export default function SettingsProvider({
  settings,
  ...rest
}: PropsWithChildren<SettingsProviderProps>) {
  const initialState = {
    ...defaultSettings,
    ...settings,
  };

  const [autoRotate, setAutoRotate] = useState(initialState.autoRotate);
  const [colorMode, setColorMode] = useState<ColorMode>(initialState.colorMode);
  const [expansionPhases, setExpansionPhases] = useState(
    initialState.expansionPhases
  );
  const [scaleMode, setScaleMode] = useState<ScaleMode>(initialState.scaleMode);
  const [scaleSize, setScaleSize] = useState<number>(initialState.scaleSize);
  const [showLayers, setShowLayers] = useState(initialState.showLayers);
  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = () => setShowSettings(!showSettings);

  const value = {
    autoRotate,
    colorMode,
    expansionPhases,
    scaleMode,
    scaleSize,
    showLayers,
    setAutoRotate,
    setColorMode,
    setExpansionPhases,
    setScaleMode,
    setScaleSize,
    setShowLayers,
    setShowSettings,
    toggleSettings,
    elapsed: 0,
    showSettings,
  };

  return <SettingsContext.Provider {...rest} value={value} />;
}
