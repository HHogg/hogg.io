const POINT_R = 4;

export type TypeAlgorithm = (n: number) => TypeVector[];
export type TypeVector = [number, number, number];

export const ZeroSpiral: TypeAlgorithm = (n) => {
  const vectors: TypeVector[] = [];

  for (let i = 0; i < n; i++) {
    vectors.push([0, 0, POINT_R]);
  }

  return vectors;
};

export const ArchimedesSpiral: TypeAlgorithm = (n) => {
  const vectors: TypeVector[] = [];

  for (let i = 0; i < n; i++) {
    const r = Math.sqrt(i + 1);
    const a = i * Math.asin(1 / r) * Math.PI;

    vectors.push([
      r * Math.cos(a),
      r * Math.sin(a),
      POINT_R,
    ]);
  }

  return vectors;
};

export const FermatSpiral = (n: number, c = 1.5): TypeVector[] => {
  const vectors: TypeVector[] = [];

  for (let i = 0; i < n; i++) {
    const a = i * c;
    const r = Math.sqrt(a);

    vectors.push([
      r * Math.cos(a),
      r * Math.sin(a),
      POINT_R,
    ]);
  }

  return vectors;
};

const isPrimeNumber = (n: number) => {
  for (let i = 2, s = Math.sqrt(n); i <= s; i++){
    if (n % i === 0) {
      return false;
    }
  }

  return n !== 1;
};

export const UlamSpiral: TypeAlgorithm = (n) => {
  const vectors: TypeVector[] = [];
  let d = 0, i = 0, sc = 1, st = 1, x = 0, y = 0;

  while (n) {
    if (isPrimeNumber(i)) {
      n--;
      vectors.push([x, y, POINT_R]);
    }

    if (!sc) {
      d = (d + 1) & 3;
      sc = d == 0 || d == 2 ? st++ : st;
    }

    sc--;
    i++;

    if (d === 0) x++;
    if (d === 1) y--;
    if (d === 2) x--;
    if (d === 3) y++;
  }

  return vectors;
};

export const VogelSpiral: TypeAlgorithm = (n) => {
  return FermatSpiral(n, 2.39998131);
};
