import atan2 from './atan2';
import isPointWithinCircle from './isPointWithinCircle';

export default (px, py, { arcs, radius, x, y }) => {
  let hasConcave = false;
  let isWithinConvaveAngle = false;

  if (!arcs) {
    return isPointWithinCircle(px, py, x, y, radius);
  }

  for (let i = 0; i < arcs.length; i++) {
    const { a1, a2, convex, cx, cy, radius } = arcs[i];
    const isWithinCircle = isPointWithinCircle(px, py, cx, cy, radius);

    if (convex && !isWithinCircle) {
      return false;
    } else if (!convex) {
      if (isWithinCircle) {
        return false;
      }

      hasConcave = true;

      if (!isWithinConvaveAngle) {
        const a3 = atan2(px, py, cx, cy, a1 > 0 && a2 > 0);

        isWithinConvaveAngle = (a1 < a2 && a3 < a2 && a3 > a1) ||
          (a2 < a1 && a3 < a1 && a3 > a2);
      }
    }
  }

  return !hasConcave || isWithinConvaveAngle;
};
