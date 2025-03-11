import { useLocalStorage } from 'preshape';
import { useEffect, useMemo } from 'react';
import { defaultSettings, Settings } from './useSettingsContext';

const localStorageKey = 'com.hogg.io.tilings.player.settings';
const localStorageVersion = 2;

const localStorageKeyVersioned = `${localStorageKey}.v${localStorageVersion}`;

export default function useVersionedSettings(
  settingsProps?: Partial<Settings>
) {
  const [settings, setSettings] = useLocalStorage(
    localStorageKeyVersioned,
    useMemo(
      () => ({
        ...defaultSettings,
        ...settingsProps,
      }),
      [settingsProps]
    )
  );

  // Remove old versions
  useEffect(() => {
    Object.keys(localStorage)
      .filter(
        (key) =>
          key.startsWith(localStorageKey) && key !== localStorageKeyVersioned
      )
      .forEach((key) => localStorage.removeItem(key));
  }, []);

  return [settings, setSettings] as const;
}
