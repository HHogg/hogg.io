import { Label, Line, Obstacle, Obstacles, Point, Rect } from '../types';
import { hasCollided } from './hasCollided';

export type LabelShiftResult = {
  shift: Point;
  labelObstacle: Obstacle<Rect>;
  labelLineObstacle: Obstacle<Line>;
};

const defaultLabel: Label = {
  id: 'default',
  width: 0,
  height: 0,
  padding: 0,
  offsetX: 0,
  offsetY: 0,
  targetX: 0,
  targetY: 0,
};

const createLabelObstacle = (
  label: Label,
  testShift = [0, 0],
  previousShift?: Point
): Obstacle<Rect> => ({
  id: `label-${label.id}`,
  type: 'solid',
  padding: label.padding,
  geometry: {
    x:
      label.targetX -
      label.width * 0.5 +
      label.offsetX +
      testShift[0] +
      (previousShift?.[0] ?? 0),
    y:
      label.targetY -
      label.height * 0.5 +
      label.offsetY +
      testShift[1] +
      (previousShift?.[1] ?? 0),
    width: label.width,
    height: label.height,
  },
});

const createLabelLineObstacle = (
  label: Label,
  labelObstacle = createLabelObstacle(label)
): Obstacle<Line> => ({
  id: `label-line-${label.id}`,
  type: 'solid',
  padding: label.padding,
  geometry: {
    x1: labelObstacle.geometry.x + labelObstacle.geometry.width * 0.5,
    y1: labelObstacle.geometry.y + labelObstacle.geometry.height * 0.5,
    x2: label.targetX,
    y2: label.targetY,
  },
});

export const createDefaultShiftResult = (
  label = defaultLabel
): LabelShiftResult => ({
  shift: [0, 0],
  labelObstacle: createLabelObstacle(label),
  labelLineObstacle: createLabelLineObstacle(label),
});

export const getLabelShifts = (
  shiftPoints: Point[],
  labels: Label[],
  obstacles: Obstacles,
  previousShiftsMap?: Record<string, LabelShiftResult>
): Record<string, LabelShiftResult> => {
  const shifts: ReturnType<typeof getLabelShifts> = {};
  const labelObstacles: Obstacle[] = [];

  nextLabel: for (const label of labels) {
    const allObstacles = [...obstacles, ...labelObstacles];

    for (const shift of [[0, 0] as Point, ...shiftPoints]) {
      const labelObstacle = createLabelObstacle(
        label,
        shift,
        previousShiftsMap?.[label.id]?.shift
      );
      const labelLineObstacle = createLabelLineObstacle(label, labelObstacle);

      if (
        !hasCollided(labelObstacle.geometry, allObstacles) &&
        !hasCollided(labelLineObstacle.geometry, labelObstacles)
      ) {
        shifts[label.id] = {
          shift,
          labelObstacle,
          labelLineObstacle,
        };

        // Add the placed label and it's line as an obstacle
        // to the following labels
        labelObstacles.push(labelObstacle);
        labelObstacles.push(labelLineObstacle);

        continue nextLabel;
      }
    }

    // If no shift was found, add the target
    shifts[label.id] = createDefaultShiftResult(label);
  }

  return shifts;
};
