import { PropsWithChildren, useState } from 'react';
import { Tiling } from '../types';
import { ArrangementContext } from './useArrangementContext';

export default function ArrangementProvider({
  children,
}: PropsWithChildren<{}>) {
  const [tiling, setTiling] = useState<Tiling | null>(null);

  const value = {
    tiling,
    setTiling,
  };

  return (
    <ArrangementContext.Provider value={value}>
      {children}
    </ArrangementContext.Provider>
  );
}
