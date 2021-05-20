import { vec3 } from 'gl-matrix';
import { Geometry, GeometryRaw, PointRaw } from './getGeometry';

const vec3ToRaw = ([a, b, c]: vec3): PointRaw => [a, b, c];

const getRawGeometries = (geometries: Geometry[]): GeometryRaw[] =>
  geometries.map(({ elements, normals, vertices }) => ({
    elements: elements ? elements.map(vec3ToRaw) : undefined,
    normals: normals ? normals.map(vec3ToRaw) : undefined,
    vertices: vertices.map(vec3ToRaw),
  }));

export default getRawGeometries;
