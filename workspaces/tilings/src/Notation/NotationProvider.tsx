import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { NotationContext } from './useNotationContext';

type NotationProviderProps = {
  notation: string;
  isValid?: boolean;
};

export default function NotationProvider({
  children,
  notation: initialNotation,
  isValid,
}: PropsWithChildren<NotationProviderProps>) {
  const [notation, setNotation] = useState(initialNotation);
  const notationRef = useRef<string>(initialNotation);

  const handleSetNotation = useCallback(
    (notation: string) => {
      notationRef.current = notation;
      setNotation(notation);
    },
    [setNotation]
  );

  useEffect(() => {
    handleSetNotation(initialNotation);
  }, [handleSetNotation, initialNotation]);

  const value = {
    notation,
    notationRef,
    path: notation.split('/')[0],
    isValid,
    setNotation: handleSetNotation,
  };

  return (
    <NotationContext.Provider value={value}>
      {children}
    </NotationContext.Provider>
  );
}
