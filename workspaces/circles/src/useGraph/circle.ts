export type Circle = {
  id?: string;
  radius: number;
  x: number;
  y: number;
};

/**
 *
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export const atan2 = (x1: number, y1: number, x2: number, y2: number) => {
  const a = Math.atan2(y1 - y2, x1 - x2);
  return a < 0 ? a + Math.PI * 2 : a;
};

/**
 *
 * @param {Circle} circle1
 * @param {Circle} circle2
 * @returns {[[number, number], [number, number]] | null}
 */
export const getIntersectionPoints = (
  circle1: Circle,
  circle2: Circle
): [[number, number], [number, number]] | null => {
  const { x: x1, y: y1, radius: r1 } = circle1;
  const { x: x2, y: y2, radius: r2 } = circle2;
  const d = Math.hypot(x2 - x1, y2 - y1);

  if (d && d <= r1 + r2 && d >= Math.abs(r2 - r1)) {
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);
    const x = x1 + (a * (x2 - x1)) / d;
    const y = y1 + (a * (y2 - y1)) / d;
    const rx = -(y2 - y1) * (h / d);
    const ry = -(x2 - x1) * (h / d);
    const p1: [number, number] = [x + rx, y - ry];
    const p2: [number, number] = [x - rx, y + ry];

    return [p1, p2];
  }

  return null;
};

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {Circle} circle
 * @returns {boolean}
 */
export const isPointInCircle = (
  x: number,
  y: number,
  { radius, x: cx, y: cy }: Circle
): boolean => {
  return (x - cx) ** 2 + (y - cy) ** 2 < radius ** 2;
};
