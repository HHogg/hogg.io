import triangulate, { Vector } from 'delaunay-triangulate';
import { vec3 } from 'gl-matrix';
import flatten from 'lodash.flatten';
import uniqBy from 'lodash.uniqby';
import random from 'lodash.random';
import shuffle from 'lodash.shuffle';
import { GeometryBase } from './getGeometry';

const getTriangulationPoints = (fractureSize = 3) => {
  const step = (2 / fractureSize);
  const points: Vector[] = [];

  for (let z = -1 + (step * 0.5); z < 1; z += step) {
    for (let y = -1 + (step * 0.5); y < 1; y += step) {
      for (let x = -1 + (step * 0.5); x < 1; x += step) {
        points.push([
          x * random(1, 1.25, true),
          y * random(1, 1.25, true),
          z * random(1, 1.25, true),
        ]);
      }
    }
  }

  return points;
};

const getExplodedGeometry = (geometry: GeometryBase): GeometryBase[] => {
  const points = getTriangulationPoints();
  const cells = triangulate(points);

  const vertices = points.map(([x, y, z]) => vec3.fromValues(x, y, z));
  const elements = uniqBy(flatten(shuffle(cells.map(([a, b, c, d]) => [
    vec3.fromValues(a, b, c),
    // vec3.fromValues(a, d, b),
    // vec3.fromValues(a, c, d),
    // vec3.fromValues(c, d, b),
  ]))), ([a, b, c]) => [a, b, c].toString());

  return [geometry];
};

const getExplodedGeometries = (geometries: GeometryBase[]): GeometryBase[] =>
  flatten(geometries.map(getExplodedGeometry));

export default getExplodedGeometries;
