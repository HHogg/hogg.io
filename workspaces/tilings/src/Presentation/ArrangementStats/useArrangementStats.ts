import { FeatureToggle } from '@hogg/wasm';
import { useMemo } from 'react';
import { usePlayerContext } from '../Player/usePlayerContext';

export type Validation =
  | FeatureToggle.ValidateGaps
  | FeatureToggle.ValidateOverlaps
  | FeatureToggle.ValidateVertexTypes;

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
    polygonsAdded: number;
    polygonsSkipped: number;
    totalDuration: number;
    totalDurationSeries: number[];
  }[];
  validations: Partial<
    Record<
      Validation,
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
  const { renderMetrics, renderResult } = usePlayerContext();

  const combinedMetricEvents = useMemo(
    () => [
      ...(renderResult?.metrics.events ?? []),
      ...(renderMetrics?.events ?? []),
    ],
    [renderMetrics?.events, renderResult]
  );

  return useMemo(() => {
    const stats = createStats();

    for (const event of combinedMetricEvents) {
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
            polygonsAdded: 0,
            polygonsSkipped: 0,
            totalDuration: 0,
            totalDurationSeries: [],
          };
        }

        const transform = stats.transforms[index];

        if (transform) {
          transform.polygonsAdded += event.counters.get('polygons_added') ?? 0;
          transform.polygonsSkipped +=
            event.counters.get('polygons_skipped') ?? 0;
          transform.totalDuration += event.duration;
          transform.totalDurationSeries.push(event.duration);
        }
      }

      if (event.key.startsWith('Validate')) {
        const flag = event.key as Validation; // TODO? Proper validation?

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

      if (event.key === 'build') {
        stats.totalDuration += event.duration;
      }

      if (event.key == 'draw_shapes') {
        stats.stageDurationDraw += event.duration;
        stats.totalDuration += event.duration;
      }

      if (event.key == 'render') {
        stats.stageDurationRender += event.duration;
        stats.totalDuration += event.duration;
      }
    }

    return stats;
  }, [combinedMetricEvents]);
}
