import { createContext, useContext } from 'react';

type NotationContextProps = {
  notation: string;
  notationRef: React.MutableRefObject<string>;
  path: string;
  transforms: string[];
  isValid?: boolean;
  setNotation: (notation: string) => void;
  previousNotation: () => void;
  nextNotation: () => void;
};

export const NotationContext = createContext<NotationContextProps>({
  notation: '',
  notationRef: { current: '' },
  path: '',
  transforms: [],
  setNotation: () => {},
  previousNotation: () => {},
  nextNotation: () => {},
});

export function useNotationContext() {
  return useContext(NotationContext);
}
