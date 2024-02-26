import { createContext, useContext } from 'react';

type NotationContextProps = {
  notation: string;
  notationRef: React.MutableRefObject<string>;
  path: string;
  isValid?: boolean;
  setNotation: (notation: string) => void;
};

export const FIRST_NOTATION = '3/m30/m(h2)';

export const NotationContext = createContext<NotationContextProps>({
  notation: '',
  notationRef: { current: '' },
  path: '',
  setNotation: () => {},
});

export function useNotationContext() {
  return useContext(NotationContext);
}
