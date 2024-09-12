import { createContext, useContext } from 'react';
import { Metrics, Tiling } from '../../types';

type ArrangementContextProps = {
  renderMetrics: Metrics | null;
  setRenderMetrics: (metrics: Metrics) => void;
  tiling: Tiling | null;
  setTiling: (tiling: Tiling) => void;
};

export const ArrangementContext = createContext<ArrangementContextProps>({
  renderMetrics: null,
  setRenderMetrics: () => {},
  tiling: null,
  setTiling: () => {},
});

export const useArrangementContext = () => useContext(ArrangementContext);
