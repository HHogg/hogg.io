import { Label, Line, Obstacle, Obstacles, Point, Rect } from '../types';
import { hasCollided } from './hasCollided';

export type LabelShiftResult = {
  labelObstacle: Obstacle<Rect>;
  labelLineObstacle: Obstacle<Line>;
};

const createLabelObstacle = (label: Label, x = 0, y = 0): Obstacle<Rect> => ({
  id: `label-${label.id}`,
  type: 'solid',
  padding: label.padding,
  geometry: {
    x: label.targetX - label.width * 0.5 + label.offsetX + x,
    y: label.targetY - label.height * 0.5 + label.offsetY + y,
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

export const createDefaultShiftResult = (label: Label): LabelShiftResult => ({
  labelObstacle: createLabelObstacle(label),
  labelLineObstacle: createLabelLineObstacle(label),
});

export const getLabelShifts = (
  shiftPoints: Point[],
  labels: Label[],
  obstacles: Obstacles
): LabelShiftResult[] => {
  const shifts: ReturnType<typeof getLabelShifts> = [];
  const labelObstacles: Obstacle[] = [];

  nextLabel: for (const label of labels) {
    const allObstacles = [...obstacles, ...labelObstacles];

    for (const shift of [undefined, ...shiftPoints]) {
      const [shiftX, shiftY] = shift ?? [0, 0];

      const labelObstacle = createLabelObstacle(label, shiftX, shiftY);
      const labelLineObstacle = createLabelLineObstacle(label, labelObstacle);

      if (
        !hasCollided(labelObstacle.geometry, allObstacles) &&
        !hasCollided(labelLineObstacle.geometry, labelObstacles)
      ) {
        shifts.push({
          labelObstacle,
          labelLineObstacle,
        });

        // Add the placed label and it's line as an obstacle
        // to the following labels
        labelObstacles.push(labelObstacle);
        labelObstacles.push(labelLineObstacle);

        continue nextLabel;
      }
    }

    // If no shift was found, add the target
    shifts.push(createDefaultShiftResult(label));
  }

  return shifts;
};
