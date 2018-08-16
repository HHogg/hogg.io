import isPointWithinCircle from './isPointWithinCircle';

export default (px, py, cx, cy, radius, padding = 0) =>
  isPointWithinCircle(px, py, cx, cy, radius, padding) &&
    !isPointWithinCircle(px, py, cx, cy, radius, padding * -1);
