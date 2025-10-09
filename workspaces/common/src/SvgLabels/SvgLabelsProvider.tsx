import { Box } from 'preshape';
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

const defaultGetPoints = (
  count: number,
  width: number,
  height: number
): Point[] => {
  return getArchimedesSpiral(count, [width * -1, width], [height * -1, height]);
};

type SvgLabelsProviderProps = {
  width: number;
  height: number;
  getPoints?: typeof defaultGetPoints;
  debugShowPoints?: boolean;
};

export default function SvgLabelsProvider({
  children,
  width,
  height,
  getPoints = defaultGetPoints,
  debugShowPoints,
  ...props
}: PropsWithChildren<SvgLabelsProviderProps>) {
  const refTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refLabels = useRef<string[]>([]);
  const refLabelsMap = useRef<Record<string, Label>>({});
  const refObstacles = useRef<Obstacle[]>([]);
  const [shifts, setShifts] = useState<Record<string, LabelShiftResult>>({});

  const points = useMemo<Point[]>(
    () => getPoints(1000, width, height),
    [getPoints, height, width]
  );

  const refreshLabelShifts = useCallback(() => {
    setShifts((shifts) =>
      getLabelShifts(
        points,
        Object.values(refLabelsMap.current),
        refObstacles.current,
        shifts
      )
    );
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
    (aId: string) => {
      refLabels.current.push(aId);
      queueReposition();

      return () => {
        refLabels.current = refLabels.current.filter((bId) => bId !== aId);
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

  const updateLabel = useCallback(
    (label: Label) => {
      refLabelsMap.current[label.id] = label;
      queueReposition();
    },
    [queueReposition]
  );

  const getLabelShift = useCallback(
    (id: string) => {
      const label: Label | undefined = refLabelsMap.current[id];
      return shifts[label?.id] ?? createDefaultShiftResult(label);
    },
    [shifts]
  );

  const value = {
    getLabelShift,
    updateLabel,
    registerLabel,
    registerObstacle,
  };

  return (
    <SvgLabelsContext.Provider {...props} value={value}>
      {debugShowPoints && (
        <>
          {points.map((point, index) => (
            <Box
              key={index}
              borderRadius="full"
              backgroundColor="text-shade-1"
              width={2}
              height={2}
              style={{
                position: 'absolute',
                transform: `translate(${point[0]}px, ${point[1]}px)`,
              }}
            />
          ))}
        </>
      )}

      {children}
    </SvgLabelsContext.Provider>
  );
}
