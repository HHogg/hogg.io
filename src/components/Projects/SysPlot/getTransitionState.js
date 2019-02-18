import lerp from './lerp';

const newState = () => ({
  color_r: [[], []],
  color_g: [[], []],
  color_b: [[], []],
  color_a: [[], []],
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
}) => {
  const next = newState();

  let i = 0;

  for (; i < positions.length; i++) {
    const [{ radius }, [x, y]] = positions[i];

    next.color_r[1][i] = pColor[0];
    next.color_g[1][i] = pColor[1];
    next.color_b[1][i] = pColor[2];
    next.color_a[1][i] = 1;
    next.radius[1][i] = radius;
    next.x[1][i] = x;
    next.y[1][i] = y;

    if (prev.radius[1][i]) {
      next.color_r[0][i] = lerp(prev.color_r[0][i], prev.color_r[1][i], t);
      next.color_g[0][i] = lerp(prev.color_g[0][i], prev.color_g[1][i], t);
      next.color_b[0][i] = lerp(prev.color_b[0][i], prev.color_b[1][i], t);
      next.color_a[0][i] = lerp(prev.color_a[0][i], prev.color_a[1][i], t);
      next.radius[0][i] = lerp(prev.radius[0][i], prev.radius[1][i], t);
      next.x[0][i] = lerp(prev.x[0][i], prev.x[1][i], t);
      next.y[0][i] = lerp(prev.y[0][i], prev.y[1][i], t);
    } else {
      next.color_r[0][i] = pColor[0];
      next.color_g[0][i] = pColor[1];
      next.color_b[0][i] = pColor[2];
      next.color_a[0][i] = 0;
      next.radius[0][i] = 0;
      next.x[0][i] = cx;
      next.y[0][i] = cy;
    }
  }

  let j = 0;

  for (; j < vectors.length; j++) {
    const [x, y] = vectors[j];

    next.color_r[1][i + j] = vColor[0];
    next.color_g[1][i + j] = vColor[1];
    next.color_b[1][i + j] = vColor[2];
    next.color_a[1][i + j] = 1;
    next.radius[1][i + j] = VECTOR_RADIUS;
    next.x[1][i + j] = x;
    next.y[1][i + j] = y;

    if (prev.radius[1][i + j]) {
      next.color_r[0][i + j] = lerp(prev.color_r[0][i + j], prev.color_r[1][i + j], t);
      next.color_g[0][i + j] = lerp(prev.color_g[0][i + j], prev.color_g[1][i + j], t);
      next.color_b[0][i + j] = lerp(prev.color_b[0][i + j], prev.color_b[1][i + j], t);
      next.color_a[0][i + j] = lerp(prev.color_a[0][i + j], prev.color_a[1][i + j], t);
      next.radius[0][i + j] = lerp(prev.radius[0][i + j], prev.radius[1][i + j], t);
      next.x[0][i + j] = lerp(prev.x[0][i + j], prev.x[1][i + j], t);
      next.y[0][i + j] = lerp(prev.y[0][i + j], prev.y[1][i + j], t);
    } else {
      next.color_r[0][i + j] = vColor[0];
      next.color_g[0][i + j] = vColor[1];
      next.color_b[0][i + j] = vColor[2];
      next.color_a[0][i + j] = 0;
      next.radius[0][i + j] = 0;
      next.x[0][i + j] = cx;
      next.y[0][i + j] = cy;
    }
  }

  let k = i + j;

  for (;k < prev.radius[1].length; k++) {
    next.color_r[0][k] = lerp(prev.color_r[0][k], prev.color_r[1][k], t);
    next.color_g[0][k] = lerp(prev.color_g[0][k], prev.color_g[1][k], t);
    next.color_b[0][k] = lerp(prev.color_b[0][k], prev.color_b[1][k], t);
    next.color_a[0][k] = lerp(prev.color_a[0][k], prev.color_a[1][k], t);
    next.radius[0][k] = lerp(prev.radius[0][k], prev.radius[1][k], t);
    next.x[0][k] = lerp(prev.x[0][k], prev.x[1][k], t);
    next.y[0][k] = lerp(prev.y[0][k], prev.y[1][k], t);

    next.color_r[1][k] = prev.color_r[1][k];
    next.color_g[1][k] = prev.color_g[1][k];
    next.color_b[1][k] = prev.color_b[1][k];
    next.color_a[1][k] = 1;
    next.radius[1][k] = 0;
    next.x[1][k] = cx;
    next.y[1][k] = cy;
  }

  return next;
};
