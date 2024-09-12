import { useMemo } from 'react';
import { Flag } from '../../types';
import { useArrangementContext } from '../Arrangement/useArrangementContext';

export type ArrangementStats = {
  totalDuration: number;
  stageDurationPlacement: number;
  stageDurationTransform: number;
  stageDurationValidation: number;
  stageDurationDraw: number;
  stageDurationRender: number;
  polygonsAdded: number;
  polygonsAddedSeries: number[];
  polygonsSkipped: number;
  polygonsSkippedSeries: number[];
  transforms: {
    totalDuration: number;
    totalDurationSeries: number[];
  }[];
  validations: Partial<
    Record<
      Flag,
      {
        totalDuration: number;
        totalDurationSeries: number[];
      }
    >
  >;
};

const createStats = (): ArrangementStats => ({
  totalDuration: 0,
  stageDurationPlacement: 0,
  stageDurationTransform: 0,
  stageDurationValidation: 0,
  stageDurationDraw: 0,
  stageDurationRender: 0,
  polygonsAdded: 0,
  polygonsAddedSeries: [],
  polygonsSkipped: 0,
  polygonsSkippedSeries: [],
  transforms: [],
  validations: {},
});

export default function useArrangementStats(): ArrangementStats {
  const { result, renderMetrics } = useArrangementContext();
  const combinedMetricEvents = useMemo(
    () => [...(result?.metrics.events ?? []), ...(renderMetrics?.events ?? [])],
    [renderMetrics?.events, result]
  );

  return useMemo(() => {
    const stats = createStats();

    for (const event of combinedMetricEvents) {
      stats.totalDuration += event.duration;

      stats.polygonsAdded += event.counters.get('polygons_added') ?? 0;
      stats.polygonsAddedSeries.push(stats.polygonsAdded);

      stats.polygonsSkipped += event.counters.get('polygons_skipped') ?? 0;
      stats.polygonsSkippedSeries.push(stats.polygonsSkipped);

      if (event.key == 'placement') {
        stats.stageDurationPlacement += event.duration;
      }

      if (event.key.startsWith('transform')) {
        const index = parseInt(event.key.split('_')[1], 10);

        stats.stageDurationTransform += event.duration;

        if (!stats.transforms[index]) {
          stats.transforms[index] = {
            totalDuration: 0,
            totalDurationSeries: [],
          };
        }

        const transform = stats.transforms[index];

        if (transform) {
          transform.totalDuration += event.duration;
          transform.totalDurationSeries.push(event.duration);
        }
      }

      if (event.key.startsWith('validation')) {
        const flag = event.key.split('_')[1] as Flag; // Proper validation?

        stats.stageDurationValidation += event.duration;

        if (!stats.validations[flag]) {
          stats.validations[flag] = {
            totalDuration: 0,
            totalDurationSeries: [],
          };
        }

        const validation = stats.validations[flag];

        if (validation) {
          validation.totalDuration += event.duration;
          validation.totalDurationSeries.push(event.duration);
        }
      }

      if (event.key == 'draw_shapes') {
        stats.stageDurationDraw += event.duration;
      }

      if (event.key == 'render') {
        stats.stageDurationRender += event.duration;
      }
    }

    return stats;
  }, [combinedMetricEvents]);
}
