import { vec3 } from 'gl-matrix';
import { Geometry } from './getGeometry';

export const getNormal = (a: vec3, b: vec3, c: vec3) => {
  return vec3.normalize(vec3.create(), vec3.cross(vec3.create(),
    vec3.subtract(vec3.create(), b, a),
    vec3.subtract(vec3.create(), c, a),
  ));
};

const getFaceNormals = ({ elements, name, vertices }: Geometry): Geometry => {
  if (!elements) {
    return { name, elements, vertices };
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
    name: name,
    elements: nextElements,
    normals: nextNormals,
    vertices: nextVertices,
  };
};

const getFaceNormalGeometries = (geometries: Geometry[]): Geometry[] =>
  geometries.map(getFaceNormals);

export default getFaceNormalGeometries;
