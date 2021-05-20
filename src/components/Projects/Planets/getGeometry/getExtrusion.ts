import { vec3 } from 'gl-matrix';
import { GeometryBase } from './getGeometry';
import getNoiseIndices from './getNoiseIndices';

const getExtrusion = (geometry: GeometryBase): GeometryBase => {
  const noises = getNoiseIndices(geometry);
  const elements: vec3[] = [];
  const vertices: vec3[] = [];
  const edgeCounts: Record<string, number> = {};
  const verticesMap: Record<string, number> = {};

  const getExtrudedVector = (n: number, s: number) => {
    edgeCounts[n] = edgeCounts[n] + 1 || 1;

    if (verticesMap[n] === undefined) {
      verticesMap[n] = vertices.push(
        vec3.scale(vec3.create(), geometry.vertices[n], 1.05),
        vec3.scale(vec3.create(), geometry.vertices[n], 1.10 + s * s * 0.5),
      ) - 2;
    }

    return verticesMap[n];
  };

  for (const [a, b, c, s] of noises) {
    const aEx = getExtrudedVector(a, s);
    const bEx = getExtrudedVector(b, s);
    const cEx = getExtrudedVector(c, s);

    elements.push(
      vec3.fromValues(cEx + 0, bEx + 0, aEx + 0),
      vec3.fromValues(aEx + 1, bEx + 1, cEx + 1),
    );
  }

  for (const [a, b, c] of noises) {
    for (const [n, m] of [[a, b], [b, c], [c, a]]) {
      if (edgeCounts[n] < 6 && edgeCounts[m] < 6) {
        const nEx = verticesMap[n];
        const mEx = verticesMap[m];

        elements.push(
          vec3.fromValues(nEx + 0, mEx + 1, nEx + 1),
          vec3.fromValues(nEx + 0, mEx + 0, mEx + 1),
        );
      }
    }
  }

  return { elements, vertices };
};

export default getExtrusion;
