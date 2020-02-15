import { SpiralConfig } from '.';

const ArchimedesSpiral = ({
  cover: cover,
  height: h,
  width: w,
  xCenter: cx,
  xDistance: xDist,
  yDistance: yDist,
  yCenter: cy,
}: SpiralConfig): [number, number][] => {
  const vectors: [number, number][] = [];
  const hxDist = xDist / 2;
  const hyDist = yDist / 2;
  const sx = (xDist / Math.PI);
  const sy = (yDist / Math.PI);
  let tx = 1, ty = 1, vx = 1, vy = 1, rx, ry;

  while (vx > 0 || vy > 0) {
    rx = sx * tx;
    ry = sy * ty;
    vx = cx + rx * Math.cos(tx);
    vy = cy + ry * Math.sin(ty);
    tx += (Math.PI / rx) * hxDist;
    ty += (Math.PI / ry) * hyDist;

    if (vx > 0 && vy > 0 && vx < w && vy < h) {
      vectors.push([vx, vy]);
    } else if (!cover) {
      return vectors;
    }
  }

  return vectors;
};


ArchimedesSpiral.NORMALISATION_FACTOR = 1;

export default ArchimedesSpiral;
