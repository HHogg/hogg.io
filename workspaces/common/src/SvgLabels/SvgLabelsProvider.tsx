import {
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Label, Obstacle, Point } from './types';
import { SvgLabelsContext } from './useSvgLabelsContext';
import { getArchimedesSpiral } from './utils/algorithms';
import { getLabelShifts } from './utils/getLabelShifts';

type SvgLabelsProviderProps = {
  maxSearchRadius: number;
};

export default function SvgLabelsProvider({
  maxSearchRadius,
  ...props
}: PropsWithChildren<SvgLabelsProviderProps>) {
  const refTimeout = useRef<NodeJS.Timeout | null>(null);
  const refLabels = useRef<Label[]>([]);
  const refObstacles = useRef<Obstacle[]>([]);
  const [shifts, setShifts] = useState<(Point | null)[]>([]);

  const points = useMemo<Point[]>(
    () =>
      getArchimedesSpiral(2000).map(([x, y]) => [
        x * maxSearchRadius,
        y * maxSearchRadius,
      ]),
    [maxSearchRadius]
  );

  const refreshLabelShifts = useCallback(() => {
    setShifts(getLabelShifts(points, refLabels.current, refObstacles.current));
  }, [points]);

  const queueReposition = useCallback(() => {
    if (refTimeout.current) {
      clearTimeout(refTimeout.current);
    }

    refTimeout.current = setTimeout(() => {
      refTimeout.current = null;
      refreshLabelShifts();
    }, 0);
  }, [refreshLabelShifts]);

  const registerLabel = useCallback(
    (label: Label) => {
      refLabels.current.push(label);
      queueReposition();

      return () => {
        refLabels.current = refLabels.current.filter((l) => l !== label);
      };
    },
    [queueReposition]
  );

  const registerObstacle = useCallback(
    (obstacle: Obstacle) => {
      refObstacles.current.push(obstacle);
      queueReposition();

      return () => {
        refObstacles.current = refObstacles.current.filter(
          (o) => o !== obstacle
        );
      };
    },
    [queueReposition]
  );

  const getLabelShift = useCallback(
    (label: Label) => {
      return shifts[refLabels.current.indexOf(label)] ?? [0, 0];
    },
    [shifts]
  );

  const value = {
    getLabelShift,
    registerLabel,
    registerObstacle,
  };

  return <SvgLabelsContext.Provider {...props} value={value} />;
}
