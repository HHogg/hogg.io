import { Point } from '../types';

/**
 * COPIED FROM THE SPIRALS PROJECT
 */
export type PointsAlgorithm = (n: number) => Point[];
export type PointAlgorithm = (index: number) => Point;

// Scale back down to between -1 and 1
const scale = (points: Point[]) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });

  const dx = (maxX - minX) * 1.1;
  const dy = (maxY - minY) * 1.1;

  return points.map(([xOrigin, yOrigin]) => {
    const x = (xOrigin / dx) * 2;
    const y = (yOrigin / dy) * 2 * -1;

    return [x, y] as Point;
  });
};

export const getPoints = (
  total: number,
  algorithm: PointAlgorithm
): Point[] => {
  const points: Point[] = [];

  for (let i = 0; i < total; i++) {
    points.push(algorithm(i));
  }

  return scale(points);
};

export const pointAlgorithmArchimedesSpiral: PointAlgorithm = (i) => {
  const r = Math.sqrt(i) || 0;
  const a = i * (r && Math.asin(1 / r)) * Math.PI;
  const x = r * Math.cos(a);
  const y = r * Math.sin(a);

  return [x, y];
};

export const getArchimedesSpiral: PointsAlgorithm = (total: number) => {
  return getPoints(total, pointAlgorithmArchimedesSpiral);
};
