export type TypeAlgorithm = (n: number) => TypeVector[];
export type TypeVector = [number, number];

const getMax = (
  mx: undefined | number,
  my: undefined | number,
  x: number,
  y: number
): [number, number] => {
  return [
    mx === undefined ? x : Math.max(Math.abs(x), mx),
    my === undefined ? y : Math.max(Math.abs(y), my),
  ];
};

const scale = (vectors: TypeVector[], mx = 1, my = 1): TypeVector[] =>
  vectors.map(([x, y]) => [x / mx, y / my] as TypeVector);

export const ZeroSpiral: TypeAlgorithm = (n) => {
  const vectors: TypeVector[] = [];

  for (let i = 0; i < n; i++) {
    vectors.push([0, 0]);
  }

  return vectors;
};

export const getArchimedesSpiral: TypeAlgorithm = (n) => {
  const vectors: TypeVector[] = [];
  let mx: undefined | number = undefined;
  let my: undefined | number = undefined;

  for (let i = 0; i < n; i++) {
    const r = Math.sqrt(i + 1);
    const a = i * Math.asin(1 / r) * Math.PI;
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);

    [mx, my] = getMax(mx, my, x, y);
    vectors.push([x, y]);
  }

  return scale(vectors, mx, my);
};

export const getFermatSpiral = (n: number, c = 1.5): TypeVector[] => {
  const vectors: TypeVector[] = [];
  let mx: undefined | number = undefined;
  let my: undefined | number = undefined;

  for (let i = 0; i < n; i++) {
    const a = i * c;
    const r = Math.sqrt(a);
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);

    [mx, my] = getMax(mx, my, x, y);
    vectors.push([x, y]);
  }

  return scale(vectors, mx, my);
};

const isPrimeNumber = (n: number) => {
  for (let i = 2, s = Math.sqrt(n); i <= s; i++) {
    if (n % i === 0) {
      return false;
    }
  }

  return n !== 1;
};

export const getUlamSpiral: TypeAlgorithm = (n) => {
  const vectors: TypeVector[] = [];
  let d = 0;
  let i = 0;
  let sc = 1;
  let st = 1;
  let x = 0;
  let y = 0;
  let mx: undefined | number = undefined;
  let my: undefined | number = undefined;

  while (n) {
    if (isPrimeNumber(i)) {
      n--;
      vectors.push([x, y]);
      [mx, my] = getMax(mx, my, x, y);
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

  return scale(vectors, mx, my);
};

export const getVogelSpiral: TypeAlgorithm = (n) => {
  return getFermatSpiral(n, 2.39998131);
};
