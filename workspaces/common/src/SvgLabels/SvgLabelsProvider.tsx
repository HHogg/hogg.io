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
import {
  LabelShiftResult,
  createDefaultShiftResult,
  getLabelShifts,
} from './utils/getLabelShifts';

type SvgLabelsProviderProps = {
  width: number;
  height: number;
};

export default function SvgLabelsProvider({
  width,
  height,
  ...props
}: PropsWithChildren<SvgLabelsProviderProps>) {
  const refTimeout = useRef<NodeJS.Timeout | null>(null);
  const refLabels = useRef<Label[]>([]);
  const refObstacles = useRef<Obstacle[]>([]);
  const [shifts, setShifts] = useState<LabelShiftResult[]>([]);

  const points = useMemo<Point[]>(
    () => getArchimedesSpiral(1000, [width * -1, width], [height * -1, height]),
    [height, width]
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
        queueReposition();
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
    (label: Label): LabelShiftResult => {
      return (
        shifts[refLabels.current.indexOf(label)] ??
        createDefaultShiftResult(label)
      );
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
