import { Metrics, Result, Tiling } from '@hogg/wasm';
import { createContext, useContext } from 'react';

type ArrangementContextProps = {
  renderMetrics: Metrics | null;
  setRenderMetrics: (metrics: Metrics) => void;
  result: Result | null;
  setResult: (result: Result) => void;
  tiling: Tiling | null;
  setTiling: (tiling: Tiling) => void;
};

export const ArrangementContext = createContext<ArrangementContextProps>({
  renderMetrics: null,
  setRenderMetrics: () => {},
  result: null,
  setResult: () => {},
  tiling: null,
  setTiling: () => {},
});

export const useArrangementContext = () => useContext(ArrangementContext);
