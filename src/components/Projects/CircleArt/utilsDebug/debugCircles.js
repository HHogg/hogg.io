import flatten from 'lodash.flatten';
import { colorNegativeShade1 } from 'preshape';
import { createCircle, createText } from '../../../../utils/Two';

export default (circles) => flatten(
  circles.map(({ n, segments, x, y }) => [
    createText(n, {
      alignment: 'middle',
      fill: colorNegativeShade1,
      family: 'script',
      size: 8,
      style: 'italic',
      x: x,
      y: y,
    }),
    ...segments.map(({ mx, my }) => createCircle({
      fill: colorNegativeShade1,
      radius: 2,
      x: mx,
      y: my,
    })),
    ...segments.map(({ mx, my, n }) => createText(n, {
      alignment: 'middle',
      family: 'script',
      fill: colorNegativeShade1,
      size: 8,
      style: 'italic',
      x: mx,
      y: my - 10,
    })),
  ]),
);
