import { vec3 } from 'gl-matrix';
import { GeometryBase } from './getGeometry';

const getMaxPoint = (geometries: GeometryBase[]) => {
  let max = 0;

  for (const geometry of geometries) {
    for (const [x, y, z] of geometry.vertices) {
      const xAbs = Math.abs(x);
      const yAbs = Math.abs(y);
      const zAbs = Math.abs(z);

      if (max < xAbs) max = xAbs;
      if (max < yAbs) max = yAbs;
      if (max < zAbs) max = zAbs;
    }
  }

  return max;
};

const getRescaledGeometries = (geometries: GeometryBase[]): GeometryBase[] => {
  const scale = Math.abs(1 / getMaxPoint(geometries));

  return geometries.map(({ elements, vertices }) => ({
    elements: elements,
    vertices: vertices.map((vector) => vec3.scale(vec3.create(), vector, scale)),
  }));
};

export default getRescaledGeometries;
