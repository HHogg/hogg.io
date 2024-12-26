import { useWasmApi } from '@hogg/wasm';
import { PropsWithChildren, useCallback, useRef, useState } from 'react';
import { useSettingsContext } from '../Settings/useSettingsContext';
import { NotationContext } from './useNotationContext';

export type NotationProviderProps = {
  notation: string;
  isValid?: boolean;
  onChange?: (notation: string) => void;
};

export default function NotationProvider({
  children,
  notation: initialNotation,
  isValid,
  onChange,
}: PropsWithChildren<NotationProviderProps>) {
  const { api } = useWasmApi();
  const [notation, setNotation] = useState(initialNotation);
  const { expansionPhases } = useSettingsContext();
  const notationRef = useRef<string>(initialNotation);

  const handleSetNotation = useCallback(
    (notation: string) => {
      notationRef.current = notation;
      setNotation(notation);
      onChange?.(notation);
    },
    [onChange]
  );

  const handlePreviousNotation = useCallback(async () => {
    const previousNotation = await api.tilings.findPreviousTiling([
      notationRef.current,
      expansionPhases,
    ]);

    if (previousNotation) {
      handleSetNotation(previousNotation);
    }
  }, [api, expansionPhases, handleSetNotation]);

  const handleNextNotation = useCallback(async () => {
    const nextNotation = await api.tilings.findNextTiling([
      notationRef.current,
      expansionPhases,
    ]);

    if (nextNotation) {
      handleSetNotation(nextNotation);
    }
  }, [api, expansionPhases, handleSetNotation]);

  const notationSplit = notation.split('/');

  const value = {
    notation,
    notationRef,
    path: notationSplit[0],
    transforms: notationSplit.slice(1),
    isValid,
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
