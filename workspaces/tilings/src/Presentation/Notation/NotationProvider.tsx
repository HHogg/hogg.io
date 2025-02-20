import { useWasmApi } from '@hogg/wasm';
import { useLocalStorage } from 'preshape';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSettingsContext } from '../Settings/useSettingsContext';
import { NotationContext } from './useNotationContext';

export type NotationProviderProps = {
  notation: string;
  onChange?: (notation: string) => void;
};

export default function NotationProvider({
  children,
  notation: initialNotation,
  onChange,
}: PropsWithChildren<NotationProviderProps>) {
  const { api } = useWasmApi();
  const [notation, setNotation] = useLocalStorage(
    'com.hogg.io.notation.input',
    initialNotation
  );
  const { expansionPhases } = useSettingsContext();
  const [hasCustomNotation, setHasCustomNotation] = useState(false);
  const notationRef = useRef<string>(initialNotation);

  const handleSetNotation = useCallback(
    (notation: string) => {
      notationRef.current = notation;
      setNotation(notation);
      onChange?.(notation);
    },
    [setNotation, onChange]
  );

  const handleSetCustomNotation = useCallback(
    (notation: string) => {
      setHasCustomNotation(true);
      handleSetNotation(notation);
    },
    [handleSetNotation]
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

  useEffect(() => {
    if (!hasCustomNotation) {
      handleSetNotation(initialNotation);
    }
  }, [handleSetNotation, initialNotation, hasCustomNotation]);

  const value = {
    notation,
    notationRef,
    path: notationSplit[0],
    transforms: notationSplit.slice(1),
    setNotation: handleSetCustomNotation,
    previousNotation: handlePreviousNotation,
    nextNotation: handleNextNotation,
  };

  return (
    <NotationContext.Provider value={value}>
      {children}
    </NotationContext.Provider>
  );
}
