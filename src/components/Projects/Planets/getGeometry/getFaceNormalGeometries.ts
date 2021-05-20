import { vec3 } from 'gl-matrix';
import { Geometry, GeometryBase } from './getGeometry';

export const getNormal = (a: vec3, b: vec3, c: vec3) => {
  return vec3.normalize(vec3.create(), vec3.cross(vec3.create(),
    vec3.subtract(vec3.create(), b, a),
    vec3.subtract(vec3.create(), c, a),
  ));
};

const getFaceNormals = ({ elements, vertices }: GeometryBase): Geometry => {
  if (!elements) {
    return { elements, vertices };
  }

  const nextElements: vec3[] = [];
  const nextNormals: vec3[] = [];
  const nextVertices: vec3[] = [];

  for (const [a, b, c] of elements) {
    const i = nextVertices.length;
    const [aVec, bVec, cVec] = [vertices[a], vertices[b], vertices[c]];
    const norm = getNormal(aVec, bVec, cVec);

    nextElements.push(vec3.fromValues(i + 0, i + 1, i + 2));
    nextNormals.push(norm, norm, norm);
    nextVertices.push(aVec, bVec, cVec);
  }

  return {
    elements: nextElements,
    normals: nextNormals,
    vertices: nextVertices,
  };
};

const getFaceNormalGeometries = (geometries: GeometryBase[]): Geometry[] =>
  geometries.map(getFaceNormals);

export default getFaceNormalGeometries;
