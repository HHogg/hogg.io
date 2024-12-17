import { Tiling, Result, Metrics } from '@hogg/wasm';
import { PropsWithChildren, useCallback, useState } from 'react';
import { ArrangementContext } from './useArrangementContext';

export default function ArrangementProvider({
  children,
}: PropsWithChildren<{}>) {
  const [tiling, setTiling] = useState<Tiling | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [renderMetrics, setRenderMetrics] = useState<Metrics | null>(null);

  const handleSetTiling = useCallback((tiling: Tiling) => {
    setTiling(tiling);
    setResult(tiling.result ?? null);
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
