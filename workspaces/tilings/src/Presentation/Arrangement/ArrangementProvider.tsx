import { PropsWithChildren, useCallback, useState } from 'react';
import { Metrics, Result, Tiling } from '../../types';
import { ArrangementContext } from './useArrangementContext';

export default function ArrangementProvider({
  children,
}: PropsWithChildren<{}>) {
  const [tiling, setTiling] = useState<Tiling | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [renderMetrics, setRenderMetrics] = useState<Metrics | null>(null);

  const handleSetTiling = useCallback((tiling: Tiling) => {
    setTiling(tiling);
    setResult(tiling.buildContext.results[0] ?? null);
  }, []);

  const value = {
    renderMetrics,
    setRenderMetrics,
    result,
    setResult,
    tiling,
    setTiling: handleSetTiling,
  };

  return (
    <ArrangementContext.Provider value={value}>
      {children}
    </ArrangementContext.Provider>
  );
}
