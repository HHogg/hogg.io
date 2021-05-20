import { vec3 } from 'gl-matrix';
import { GeometryBase } from './getGeometry';

const f = (1 + Math.sqrt(5)) / 2;

const baseVertices: vec3[] = [
  vec3.fromValues(-1, f, 0),
  vec3.fromValues(1, f, 0),
  vec3.fromValues(-1, -f, 0),
  vec3.fromValues(1, -f, 0),
  vec3.fromValues(0, -1, f),
  vec3.fromValues(0, 1, f),
  vec3.fromValues(0, -1, -f),
  vec3.fromValues(0, 1, -f),
  vec3.fromValues(f, 0, -1),
  vec3.fromValues(f, 0, 1),
  vec3.fromValues(-f, 0, -1),
  vec3.fromValues(-f, 0, 1),
];

const baseElements: vec3[] = [
  vec3.fromValues(0, 11, 5),
  vec3.fromValues(0, 5, 1),
  vec3.fromValues(0, 1, 7),
  vec3.fromValues(0, 7, 10),
  vec3.fromValues(0, 10, 11),
  vec3.fromValues(11, 10, 2),
  vec3.fromValues(5, 11, 4),
  vec3.fromValues(1, 5, 9),
  vec3.fromValues(7, 1, 8),
  vec3.fromValues(10, 7, 6),
  vec3.fromValues(3, 9, 4),
  vec3.fromValues(3, 4, 2),
  vec3.fromValues(3, 2, 6),
  vec3.fromValues(3, 6, 8),
  vec3.fromValues(3, 8, 9),
  vec3.fromValues(9, 8, 1),
  vec3.fromValues(4, 9, 5),
  vec3.fromValues(2, 4, 11),
  vec3.fromValues(6, 2, 10),
  vec3.fromValues(8, 6, 7),
];

const subdivide = ({ elements, vertices }: GeometryBase) => {
  const nextElements: vec3[] = [];
  const nextVertices: vec3[] = vertices.slice();
  const midpoints: Record<string, number> = {};

  const getMidPoint = (a: number, b: number) => {
    if (midpoints[`${a},${b}`]) return midpoints[`${a},${b}`];
    if (midpoints[`${b},${a}`]) return midpoints[`${b},${a}`];

    const midPoint = vec3.scale(vec3.create(), vec3.add(vec3.create(), vertices[a], vertices[b]), 0.5);
    const midPointIndex = nextVertices.push(midPoint) - 1;

    return midpoints[`${a},${b}`] = midPointIndex;
  };

  for (const [a, b, c] of elements) {
    const aMid = getMidPoint(a, b);
    const bMid = getMidPoint(b, c);
    const cMid = getMidPoint(c, a);

    nextElements.push(
      vec3.fromValues(a, aMid, cMid),
      vec3.fromValues(b, bMid, aMid),
      vec3.fromValues(c, cMid, bMid),
      vec3.fromValues(aMid, bMid, cMid),
    );
  }

  return {
    elements: nextElements,
    vertices: nextVertices,
  };
};

const getIcosphere = (subdivisions: number): GeometryBase => {
  const { elements, vertices } = Array
    .from({ length: subdivisions })
    .reduce(subdivide, {
      elements: baseElements,
      vertices: baseVertices,
    });

  const verticesScaledAndJittered = vertices.map((vec) =>
    vec3.scale(vec3.create(), vec, 1 / Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2])));

  return {
    elements: elements,
    vertices: verticesScaledAndJittered,
  };
};

export default getIcosphere;
