import { PropsWithChildren, useState } from 'react';
import { ColorMode, ScaleMode } from '../../types';
import {
  Settings,
  SettingsContext,
  defaultOptions,
} from './useSettingsContext';

export type SettingsProviderProps = {
  options?: Partial<Settings>;
};

export default function SettingsProvider({
  options,
  ...rest
}: PropsWithChildren<SettingsProviderProps>) {
  const initialState = {
    ...defaultOptions,
    ...options,
  };

  const [autoRotate, setAutoRotate] = useState(initialState.autoRotate);
  const [colorMode, setColorMode] = useState<ColorMode>(initialState.colorMode);
  const [expansionPhases, setExpansionPhases] = useState(
    initialState.expansionPhases
  );
  const [scaleMode, setScaleMode] = useState<ScaleMode>(initialState.scaleMode);
  const [scaleSize, setScaleSize] = useState<number>(initialState.scaleSize);
  const [showAnnotations, setShowAnnotations] = useState(
    initialState.showAnnotations
  );
  const [showDebug, setShowDebug] = useState(initialState.showDebug);
  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = () => setShowSettings(!showSettings);

  const value = {
    autoRotate,
    colorMode,
    expansionPhases,
    scaleMode,
    scaleSize,
    showAnnotations,
    showDebug,
    setAutoRotate,
    setColorMode,
    setExpansionPhases,
    setScaleMode,
    setScaleSize,
    setShowAnnotations,
    setShowDebug,
    setShowSettings,
    toggleSettings,
    elapsed: 0,
    showSettings,
  };

  return <SettingsContext.Provider {...rest} value={value} />;
}
