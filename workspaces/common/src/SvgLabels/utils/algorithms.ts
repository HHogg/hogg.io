import { createLinearScale } from '../../utils';
import { Point } from '../types';

export const pointAlgorithmArchimedesSpiral = (i: number): Point => {
  const r = Math.sqrt(i) || 0;
  const a = i * (r && Math.asin(1 / r)) * Math.PI;
  const x = r * Math.cos(a);
  const y = r * Math.sin(a);

  return [x, y];
};

export const getArchimedesSpiral = (
  total: number,
  xRange: Point,
  yRange: Point
): Point[] => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const points: Point[] = [];
  for (let i = 0; i < total; i++) {
    const [x, y] = pointAlgorithmArchimedesSpiral(i);

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;

    points.push([x, y]);
  }

  const xScale = createLinearScale([minX, maxX], xRange);
  const yScale = createLinearScale([minY, maxY], yRange);

  return points.map(([xOrigin, yOrigin]) => {
    return [xScale(xOrigin), yScale(yOrigin)] as Point;
  });
};
