import { colorPositiveShade1 } from 'preshape';
import { createCircle, createPolygonArc } from '../../../../utils/Two';

const createAreaShape = ({ arcs, radius, x, y }, props) => arcs
  ? createPolygonArc({ ...props, arcs })
  : createCircle({ ...props, radius, x, y });

export default (areas) => [
  ...areas.map((area) => createAreaShape(area, {
    fill: colorPositiveShade1,
    opacity: 0.1,
  })),
  ...areas.map((area) => createAreaShape(area, {
    stroke: colorPositiveShade1,
    strokeWidth: 1,
  })),
];
