export type Point = [number, number];

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
  const r = Math.sqrt(i);
  const a = i * Math.asin(1 / r) * Math.PI;
  const x = r * Math.cos(a);
  const y = r * Math.sin(a);

  return [x, y];
};

export const createPointAlgorithmFermatSpiral =
  (c = 1.5): PointAlgorithm =>
  (i) => {
    const a = i * c;
    const r = Math.sqrt(a);
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);

    return [x, y];
  };

export const pointAlgorithmFermatSpiral = createPointAlgorithmFermatSpiral();

export const pointAlgorithmVogelSpiral =
  createPointAlgorithmFermatSpiral(2.39998131);

export const getArchimedesSpiral: PointsAlgorithm = (total: number) => {
  return getPoints(total, pointAlgorithmArchimedesSpiral);
};

export const getFermatSpiral = (total: number) => {
  return getPoints(total, pointAlgorithmFermatSpiral);
};

export const getVogelSpiral: PointsAlgorithm = (total: number) => {
  return getPoints(total, pointAlgorithmVogelSpiral);
};

const isPrimeNumber = (n: number) => {
  for (let i = 2, s = Math.sqrt(n); i <= s; i++) {
    if (n % i === 0) {
      return false;
    }
  }

  return n !== 1;
};

export const getUlamSpiral: PointsAlgorithm = (n) => {
  let direction = 0;
  let index = 0;
  let shiftCount = 1;
  let shiftTotal = 1;
  let x = 0;
  let y = 0;

  const points: Point[] = [];

  while (n) {
    if (isPrimeNumber(index)) {
      n--;
      points.push([x, y]);
    }

    if (!shiftCount) {
      direction = (direction + 1) % 4;
      shiftCount = direction == 0 || direction == 2 ? shiftTotal++ : shiftTotal;
    }

    shiftCount--;
    index++;

    if (direction === 0) x++;
    if (direction === 1) y--;
    if (direction === 2) x--;
    if (direction === 3) y++;
  }

  return scale(points);
};
