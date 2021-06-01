import { vec3 } from 'gl-matrix';
import { Geometry, GeometryRaw, Vec3Raw } from './getGeometry';

const vec3ToRaw = ([a, b, c]: vec3): Vec3Raw => [a, b, c];

const getRawGeometries = (geometries: Geometry[]): GeometryRaw[] =>
  geometries.map(({ name, elements, normals, vertices, meta }) => ({
    name: name,
    elements: elements ? elements.map(vec3ToRaw) : undefined,
    normals: normals ? normals.map(vec3ToRaw) : undefined,
    vertices: vertices.map(vec3ToRaw),
    meta: meta,
  }));

export default getRawGeometries;
