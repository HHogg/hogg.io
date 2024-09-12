import { useContext } from 'react';
import { ArrangementStatsContext } from './ArrangementStatsProvider';

export const useArrangementStatsContext = () => {
  const context = useContext(ArrangementStatsContext);

  if (!context) {
    throw new Error(
      'useArrangementStatsContext must be used within an ArrangementStatsProvider'
    );
  }

  return context;
};
