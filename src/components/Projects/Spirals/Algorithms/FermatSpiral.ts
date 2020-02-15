import { SpiralConfig } from '.';

const FermatSpiral = ({
  cover: cover,
  height: h,
  width: w,
  xCenter: cx,
  xDistance: xDist,
  yDistance: yDist,
  yCenter: cy,
}: SpiralConfig, c = 1.5): [number, number][] => {
  const vectors: [number, number][] = [];
  let rx, ry, tx = 0, ty = 0, vx = 1, vy = 1;

  while (vx > 0 || vy > 0) {
    rx = (xDist / Math.PI) * Math.sqrt(tx += c);
    ry = (yDist / Math.PI) * Math.sqrt(ty += c);
    vx = cx + rx * Math.cos(tx);
    vy = cy + ry * Math.sin(ty);

    if (vx > 0 && vy > 0 && vx < w && vy < h) {
      vectors.push([vx, vy]);
    } else if (!cover) {
      return vectors;
    }
  }

  return vectors;
};

FermatSpiral.NORMALISATION_FACTOR = 2.55;

export default FermatSpiral;
