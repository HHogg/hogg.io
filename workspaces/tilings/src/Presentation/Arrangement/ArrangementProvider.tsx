import { PropsWithChildren, useState } from 'react';
import { Metrics, Tiling } from '../../types';
import { ArrangementContext } from './useArrangementContext';

export default function ArrangementProvider({
  children,
}: PropsWithChildren<{}>) {
  const [tiling, setTiling] = useState<Tiling | null>(null);
  const [renderMetrics, setRenderMetrics] = useState<Metrics | null>(null);

  const value = {
    renderMetrics,
    setRenderMetrics,
    tiling,
    setTiling,
  };

  return (
    <ArrangementContext.Provider value={value}>
      {children}
    </ArrangementContext.Provider>
  );
}
