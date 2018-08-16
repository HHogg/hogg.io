import floor from 'lodash.floor';

const precise = (n) => floor(n, 5);

export default (circle1, circle2) => {
  const { x: x1, y: y1, radius: r1 } = circle1;
  const { x: x2, y: y2, radius: r2 } = circle2;
  const d = Math.hypot(x2 - x1, y2 - y1);

  if (d && d <= r1 + r2 && d >= Math.abs(r2 - r1)) {
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);
    const x = x1 + a * (x2 - x1) / d;
    const y = y1 + a * (y2 - y1) / d;
    const rx = -(y2 - y1) * (h / d);
    const ry = -(x2 - x1) * (h / d);
    const p1 = [precise(x + rx), precise(y - ry)];
    const p2 = [precise(x - rx), precise(y + ry)];

    return [p1, p2];
  }

  return [];
};
