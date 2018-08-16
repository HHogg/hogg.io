import flatten from 'lodash.flatten';
import { colorAccent1Shade1 } from 'preshape';
import { createCircle, createText } from '../../../../utils/Two';

export default (vectors) => flatten(
  vectors.map(({ n, x, y }) => [
    createCircle({
      fill: colorAccent1Shade1,
      radius: 2,
      x: x,
      y: y,
    }),
    createText(n, {
      alignment: 'middle',
      fill: colorAccent1Shade1,
      family: 'script',
      size: 8,
      style: 'italic',
      x: x,
      y: y - 10,
    }),
  ]),
);
