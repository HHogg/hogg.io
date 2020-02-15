export interface State {
  colorR: [number[], number[]];
  colorG: [number[], number[]];
  colorB: [number[], number[]];
  colorA: [number[], number[]];
  radius: [number[], number[]];
  x: [number[], number[]];
  y: [number[], number[]];
}

interface Props {
  cx: number;
  cy: number;
  pColor: [number, number, number];
  positions: [number, number, number][];
  prev?: State;
  t?: number;
  vColor: [number, number, number];
  vectors: [number, number][];
}

const lerp = (n0: number, n1: number, t: number) => n0 + ((n1 - n0) * t);

const newState = (): State => ({
  colorR: [[], []],
  colorG: [[], []],
  colorB: [[], []],
  colorA: [[], []],
  radius: [[], []],
  x: [[], []],
  y: [[], []],
});

const VECTOR_RADIUS = 1;

export default ({
  cx,
  cy,
  pColor,
  positions,
  prev = newState(),
  t = 1,
  vColor,
  vectors,
}: Props) => {
  const next = newState();

  let i = 0;

  for (; i < positions.length; i++) {
    const [radius, x, y] = positions[i];

    next.colorR[1][i] = pColor[0];
    next.colorG[1][i] = pColor[1];
    next.colorB[1][i] = pColor[2];
    next.colorA[1][i] = 1;
    next.radius[1][i] = radius;
    next.x[1][i] = x;
    next.y[1][i] = y;

    if (prev.radius[1][i]) {
      next.colorR[0][i] = lerp(prev.colorR[0][i], prev.colorR[1][i], t);
      next.colorG[0][i] = lerp(prev.colorG[0][i], prev.colorG[1][i], t);
      next.colorB[0][i] = lerp(prev.colorB[0][i], prev.colorB[1][i], t);
      next.colorA[0][i] = lerp(prev.colorA[0][i], prev.colorA[1][i], t);
      next.radius[0][i] = lerp(prev.radius[0][i], prev.radius[1][i], t);
      next.x[0][i] = lerp(prev.x[0][i], prev.x[1][i], t);
      next.y[0][i] = lerp(prev.y[0][i], prev.y[1][i], t);
    } else {
      next.colorR[0][i] = pColor[0];
      next.colorG[0][i] = pColor[1];
      next.colorB[0][i] = pColor[2];
      next.colorA[0][i] = 0;
      next.radius[0][i] = 0;
      next.x[0][i] = cx;
      next.y[0][i] = cy;
    }
  }

  let j = 0;

  for (; j < vectors.length; j++) {
    const [x, y] = vectors[j];

    next.colorR[1][i + j] = vColor[0];
    next.colorG[1][i + j] = vColor[1];
    next.colorB[1][i + j] = vColor[2];
    next.colorA[1][i + j] = 1;
    next.radius[1][i + j] = VECTOR_RADIUS;
    next.x[1][i + j] = x;
    next.y[1][i + j] = y;

    if (prev.radius[1][i + j]) {
      next.colorR[0][i + j] = lerp(prev.colorR[0][i + j], prev.colorR[1][i + j], t);
      next.colorG[0][i + j] = lerp(prev.colorG[0][i + j], prev.colorG[1][i + j], t);
      next.colorB[0][i + j] = lerp(prev.colorB[0][i + j], prev.colorB[1][i + j], t);
      next.colorA[0][i + j] = lerp(prev.colorA[0][i + j], prev.colorA[1][i + j], t);
      next.radius[0][i + j] = lerp(prev.radius[0][i + j], prev.radius[1][i + j], t);
      next.x[0][i + j] = lerp(prev.x[0][i + j], prev.x[1][i + j], t);
      next.y[0][i + j] = lerp(prev.y[0][i + j], prev.y[1][i + j], t);
    } else {
      next.colorR[0][i + j] = vColor[0];
      next.colorG[0][i + j] = vColor[1];
      next.colorB[0][i + j] = vColor[2];
      next.colorA[0][i + j] = 0;
      next.radius[0][i + j] = 0;
      next.x[0][i + j] = cx;
      next.y[0][i + j] = cy;
    }
  }

  let k = i + j;

  for (;k < prev.radius[1].length; k++) {
    next.colorR[0][k] = lerp(prev.colorR[0][k], prev.colorR[1][k], t);
    next.colorG[0][k] = lerp(prev.colorG[0][k], prev.colorG[1][k], t);
    next.colorB[0][k] = lerp(prev.colorB[0][k], prev.colorB[1][k], t);
    next.colorA[0][k] = lerp(prev.colorA[0][k], prev.colorA[1][k], t);
    next.radius[0][k] = lerp(prev.radius[0][k], prev.radius[1][k], t);
    next.x[0][k] = lerp(prev.x[0][k], prev.x[1][k], t);
    next.y[0][k] = lerp(prev.y[0][k], prev.y[1][k], t);

    next.colorR[1][k] = prev.colorR[1][k];
    next.colorG[1][k] = prev.colorG[1][k];
    next.colorB[1][k] = prev.colorB[1][k];
    next.colorA[1][k] = 1;
    next.radius[1][k] = 0;
    next.x[1][k] = cx;
    next.y[1][k] = cy;
  }

  return next;
};
