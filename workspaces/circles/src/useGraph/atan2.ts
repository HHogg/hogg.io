export default function atan2(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  normalise = true
) {
  let a = Math.atan2(y1 - y2, x1 - x2);
  if (normalise && a < 0) a += Math.PI * 2;
  return a;
}
