import { useWasmApi } from '@hogg/wasm';
import { PropsWithChildren, useCallback, useRef, useState } from 'react';
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
    const previousNotation = await api.findPreviousTiling([
      notationRef.current,
    ]);

    if (previousNotation) {
      handleSetNotation(previousNotation);
    }
  }, [api, handleSetNotation]);

  const handleNextNotation = useCallback(async () => {
    const nextNotation = await api.findNextTiling([notationRef.current]);

    if (nextNotation) {
      handleSetNotation(nextNotation);
    }
  }, [api, handleSetNotation]);

  const value = {
    notation,
    notationRef,
    path: notation.split('/')[0],
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
