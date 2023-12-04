import { createContext, useContext } from 'react';
import { Tiling } from '../types';

type ArrangementContextProps = {
  tiling: Tiling | null;
  setTiling: (tiling: Tiling) => void;
};

export const ArrangementContext = createContext<ArrangementContextProps>({
  tiling: null,
  setTiling: () => {},
});

export const useArrangementContext = () => useContext(ArrangementContext);
