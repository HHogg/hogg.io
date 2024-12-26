import { ColorPalette, ScaleMode } from '@hogg/wasm';
import { useLocalStorage } from 'preshape';
import { PropsWithChildren, useEffect, useState } from 'react';
import {
  Settings,
  SettingsContext,
  defaultSettings,
} from './useSettingsContext';

type SettingsProviderProps = {
  settings?: Partial<Settings>;
};

export default function SettingsProvider({
  settings,
  ...rest
}: PropsWithChildren<SettingsProviderProps>) {
  const [initialState, setInitialState] = useLocalStorage(
    'com.hogg.io.tilings.player.settings',
    {
      ...defaultSettings,
      ...settings,
    }
  );

  const [autoRotate, setAutoRotate] = useState(initialState.autoRotate);
  const [colorMode, setColorMode] = useState(initialState.colorMode);
  const [colorPalette, setColorPalette] = useState<ColorPalette>(
    initialState.colorPalette
  );
  const [expansionPhases, setExpansionPhases] = useState(
    initialState.expansionPhases
  );
  const [scaleMode, setScaleMode] = useState<ScaleMode>(initialState.scaleMode);
  const [showLayers, setShowLayers] = useState(initialState.showLayers);
  const [showSettings, setShowSettings] = useState(false);
  const [speed, setSpeed] = useState(initialState.speed);

  const toggleSettings = () => setShowSettings(!showSettings);

  useEffect(() => {
    setInitialState({
      autoRotate,
      colorMode,
      colorPalette,
      expansionPhases,
      scaleMode,
      showLayers,
      speed,
    });
  }, [
    setInitialState,
    autoRotate,
    colorMode,
    colorPalette,
    expansionPhases,
    scaleMode,
    showLayers,
    speed,
  ]);

  const value = {
    autoRotate,
    colorMode,
    colorPalette,
    expansionPhases,
    scaleMode,
    showLayers,
    speed,
    setAutoRotate,
    setColorMode,
    setColorPalette,
    setExpansionPhases,
    setScaleMode,
    setShowLayers,
    setShowSettings,
    setSpeed,
    toggleSettings,
    elapsed: 0,
    showSettings,
  };

  return <SettingsContext.Provider {...rest} value={value} />;
}
