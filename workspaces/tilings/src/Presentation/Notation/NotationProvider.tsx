import { useWasmApi } from '@hogg/wasm';
import { useLocalStorage } from 'preshape';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePlayerContext } from '../Player/usePlayerContext';
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
  const { updateNotation, reset } = usePlayerContext();
  const { expansionPhases } = useSettingsContext();
  const [hasCustomNotation, setHasCustomNotation] = useState(false);

  const notationRef = useRef<string>('');
  const delayRef = useRef<number | null>(null);

  const handleSetNotation = useCallback(
    (notation: string) => {
      if (notation === notationRef.current) {
        return;
      }

      notationRef.current = notation;
      setNotation(notation);
      updateNotation(notation);
      onChange?.(notation);
    },
    [setNotation, updateNotation, onChange]
  );

  const handleSetCustomNotation = useCallback(
    (notation: string) => {
      reset();
      setHasCustomNotation(true);
      handleSetNotation(notation);
    },
    [handleSetNotation, reset]
  );

  const handlePreviousNotation = useCallback(async () => {
    const previousNotation = await api.tilings.findPreviousTiling([
      notationRef.current,
      expansionPhases,
    ]);

    if (previousNotation) {
      handleSetCustomNotation(previousNotation);
    }
  }, [api, expansionPhases, handleSetCustomNotation]);

  const handleNextNotation = useCallback(async () => {
    const nextNotation = await api.tilings.findNextTiling([
      notationRef.current,
      expansionPhases,
    ]);

    if (nextNotation) {
      handleSetCustomNotation(nextNotation);
    }
  }, [api, expansionPhases, handleSetCustomNotation]);

  const notationSplit = notation.split('/');

  useEffect(() => {
    if (!hasCustomNotation) {
      if (delayRef.current) {
        window.clearTimeout(delayRef.current);
      }

      delayRef.current = window.setTimeout(() => {
        handleSetNotation(initialNotation);
      }, 1_000);
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
