import { SpiralConfig } from '.';

const R = 0;
const U = 1;
const L = 2;
const D = 3;

const isPrimeNumber = (n: number) => {
  for (let i = 2, s = Math.sqrt(n); i <= s; i++){
    if (n % i === 0) {
      return false;
    }
  }

  return n !== 1;
};

const UlamSpiral = ({
  cover: cover,
  height: h,
  width: w,
  xCenter: cx,
  xDistance: xDist,
  yDistance: yDist,
  yCenter: cy,
}: SpiralConfig): [number, number][] => {
  const vectors: [number, number][] = [];
  let n = 0;
  let d = R;
  let vx = cx - (xDist / 2);
  let vy = cy - (yDist / 2);
  let sc = 1, st = 1;

  while (vx > 0 || vy > 0) {
    if (isPrimeNumber(n++)) {
      if (vx > 0 && vy > 0 && vx < w && vy < h) {
        vectors.push([vx, vy]);
      } else if (!cover) {
        return vectors;
      }
    }

    if (!sc) {
      d = (d + 1) & 3;
      sc = d === R || d === L ? st++ : st;
    }

    sc--;

    if (d === R) { vx += xDist; }
    if (d === U) { vy -= yDist; }
    if (d === L) { vx -= xDist; }
    if (d === D) { vy += yDist; }
  }

  return vectors;
};

UlamSpiral.NORMALISATION_FACTOR = 0.66;

export default UlamSpiral;
