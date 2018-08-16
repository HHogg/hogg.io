export default (x1, y1, x2, y2, normalise = true) => {
  let a = Math.atan2(y1 - y2, x1 - x2);
  if (normalise && a < 0) a += Math.PI * 2;
  return a;
};
