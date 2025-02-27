import { useWasmApi } from '@hogg/wasm';
import { PropsWithChildren, useCallback } from 'react';
import { useSettingsContext } from '../Settings/useSettingsContext';
import { NotationContext } from './useNotationContext';

export type NotationProviderProps = {
  notation: string;
  onChange?: (notation: string) => void;
};

export default function NotationProvider({
  children,
  notation,
  onChange,
}: PropsWithChildren<NotationProviderProps>) {
  const { api } = useWasmApi();
  const { expansionPhases, featureToggles } = useSettingsContext();

  const handleSetNotation = useCallback(
    (notation: string) => {
      onChange?.(notation);
    },
    [onChange]
  );

  const handlePreviousNotation = useCallback(async () => {
    const previousNotation = await api.tilings.findPreviousTiling([
      notation,
      expansionPhases,
      featureToggles,
    ]);

    if (previousNotation) {
      handleSetNotation(previousNotation);
    }
  }, [api, expansionPhases, featureToggles, notation, handleSetNotation]);

  const handleNextNotation = useCallback(async () => {
    const nextNotation = await api.tilings.findNextTiling([
      notation,
      expansionPhases,
      featureToggles,
    ]);

    if (nextNotation) {
      handleSetNotation(nextNotation);
    }
  }, [api, expansionPhases, featureToggles, notation, handleSetNotation]);

  const notationSplit = notation.split('/');

  const value = {
    notation,
    path: notationSplit[0],
    transforms: notationSplit.slice(1),
    setNotation: handleSetNotation,
    previousNotation: handlePreviousNotation,
    nextNotation: handleNextNotation,
  };

  return (
    <NotationContext.Provider value={value}>
      {children}
    </NotationContext.Provider>
  );
}
