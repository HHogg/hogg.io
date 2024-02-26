import { Label, Obstacles, Point } from '../types';
import { hasCollided } from './hasCollided';

function shiftLabel(label: Label, shift: Point): Label {
  return {
    ...label,
    geometry: {
      ...label.geometry,
      x: label.geometry.x + shift[0],
      y: label.geometry.y + shift[1],
    },
  };
}

export const getLabelShifts = (
  points: Point[],
  labels: Label[],
  obstacles: Obstacles
): (Point | null)[] => {
  const shifts: ReturnType<typeof getLabelShifts> = [];
  const labelObstacles = [];

  nextLabel: for (const label of labels) {
    const allObstacles = [...obstacles, ...labelObstacles];

    for (const shift of points) {
      const shiftedLabel = shiftLabel(label, shift);

      // The line that connects the label to
      // it's originally placed point as an obstacle
      const cx = shiftedLabel.geometry.width * 0.5;
      const cy = shiftedLabel.geometry.height * 0.5;
      const shiftedLabelLine = {
        id: `${label.id}-line`,
        padding: label.padding,
        geometry: {
          x1: shiftedLabel.geometry.x + cx,
          y1: shiftedLabel.geometry.y + cy,
          x2: label.geometry.x + cx,
          y2: label.geometry.y + cy,
        },
      };

      if (
        !hasCollided(shiftedLabel.geometry, allObstacles) &&
        !hasCollided(shiftedLabelLine.geometry, labelObstacles)
      ) {
        shifts.push(shift);

        // Add the placed label and it's line as an obstacle
        // to the following labels
        labelObstacles.push(shiftedLabel);
        labelObstacles.push(shiftedLabelLine);

        continue nextLabel;
      }
    }

    shifts.push(null);
  }

  return shifts;
};
