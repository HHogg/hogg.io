import isPointWithinCircle from './isPointWithinCircle';

export default function isPointOverCircleEdge(
  px: number,
  py: number,
  cx: number,
  cy: number,
  radius: number,
  padding: number = 0
) {
  return (
    isPointWithinCircle(px, py, cx, cy, radius, padding) &&
    !isPointWithinCircle(px, py, cx, cy, radius, padding * -1)
  );
}
