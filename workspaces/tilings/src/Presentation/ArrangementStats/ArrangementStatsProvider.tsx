import { createContext, PropsWithChildren } from 'react';
import useArrangementStats, { ArrangementStats } from './useArrangementStats';

export const ArrangementStatsContext = createContext<ArrangementStats | null>(
  null
);

export default function ArrangementStatsProvider(props: PropsWithChildren<{}>) {
  const stats = useArrangementStats();

  return <ArrangementStatsContext.Provider {...props} value={stats} />;
}
