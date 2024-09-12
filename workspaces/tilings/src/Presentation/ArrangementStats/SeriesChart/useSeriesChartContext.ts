import { useContext } from 'react';
import { SeriesChartContext } from './SeriesChart';

export const useSeriesChartContext = () => {
  return useContext(SeriesChartContext);
};
