import { createLinearScale } from '../../utils';
import { Point } from '../types';

const pointAlgorithmArchimedesSpiral = (i: number): Point => {
  const r = Math.sqrt(i) || 0;
  const a = i * (r && Math.asin(1 / r)) * Math.PI + Math.PI * 1.5;
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

const pointAlgorithmSquare = (
  i: number,
  columns: number,
  rows: number
): Point => {
  const x = (i % columns) - (columns - 1) / 2;
  const y = Math.floor(i / columns) - (rows - 1) / 2;
  return [x, y];
};

export const getRectangularSpiral = (
  total: number,
  xRange: Point,
  yRange: Point
): Point[] => {
  // Calculate aspect ratio from the ranges
  const xRangeSize = xRange[1] - xRange[0];
  const yRangeSize = yRange[1] - yRange[0];
  const aspectRatio = xRangeSize / yRangeSize;

  // Calculate columns and rows based on aspect ratio
  const columns = Math.ceil(Math.sqrt(total * aspectRatio));
  const rows = Math.ceil(total / columns);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const points: Point[] = [];
  for (let i = 0; i < total; i++) {
    const [x, y] = pointAlgorithmSquare(i, columns, rows);

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;

    points.push([x, y]);
  }

  // Scale points to fit the ranges using actual min/max values
  const xScale = createLinearScale([minX, maxX], xRange);
  const yScale = createLinearScale([minY, maxY], yRange);

  return points.map(([xOrigin, yOrigin]) => {
    return [xScale(xOrigin), yScale(yOrigin)] as Point;
  });
};
