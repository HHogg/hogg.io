import SimplexNoise from 'simplex-noise';
import { vec3 } from 'gl-matrix';
import random from 'lodash.random';

export interface Geometry {
  heights: Float32Array;
  normals: Float32Array;
  elements: Uint16Array;
  vertices: Float32Array;
}

const EXTRUSION = 1.5;
const EXTRUSION_HEIGHT = EXTRUSION + 0.1;
const HEIGHT_MULTI = 0.04;
const JITTER = 0.075;
const SUBDIVISIONS = 4;

const getIcosphere = (): [Float32Array, Uint16Array] => {
  const f = (1 + Math.sqrt(5)) / 2;
  const T = Math.pow(4, SUBDIVISIONS);
  const vertices = new Float32Array((10 * T + 2) * 3);
  const midpoints = new Map<string, number>();
  let v = 12;

  vertices.set(Float32Array.of(
    -1, f, 0, 1, f, 0, -1, -f, 0, 1, -f, 0,
    0, -1, f, 0, 1, f, 0, -1, -f, 0, 1, -f,
    f, 0, -1, f, 0, 1, -f, 0, -1, -f, 0, 1
  ));

  const addMidpoint = (a: number, b: number) => {
    midpoints.set(`${a},${b}`, v);
    vertices[3 * v + 0] = (vertices[3 * a + 0] + vertices[3 * b + 0]) * 0.5;
    vertices[3 * v + 1] = (vertices[3 * a + 1] + vertices[3 * b + 1]) * 0.5;
    vertices[3 * v + 2] = (vertices[3 * a + 2] + vertices[3 * b + 2]) * 0.5;
    return v++;
  };

  const getMidpoint = (a: number, b: number) =>
    midpoints.get(`${a},${b}`) ||
    midpoints.get(`${b},${a}`) ||
    addMidpoint(a, b);

  const subdivide = (ts: Uint16Array): Uint16Array => {
    const triangles = new Uint16Array(ts.length * 4);

    for (let i = 0; i < ts.length; i += 3) {
      const ai = ts[i + 0], bi = ts[i + 1], ci = ts[i + 2];
      const a = getMidpoint(ai, bi);
      const b = getMidpoint(bi, ci);
      const c = getMidpoint(ci, ai);
      triangles[(i * 4) + 0] = ai; triangles[(i * 4) + 1] = a; triangles[(i * 4) + 2] = c;
      triangles[(i * 4) + 3] = bi; triangles[(i * 4) + 4] = b; triangles[(i * 4) + 5] = a;
      triangles[(i * 4) + 6] = ci; triangles[(i * 4) + 7] = c; triangles[(i * 4) + 8] = b;
      triangles[(i * 4) + 9] = a; triangles[(i * 4) + 10] = b; triangles[(i * 4) + 11] = c;
    }

    return triangles;
  };

  const triangles = Array
    .from({ length: SUBDIVISIONS })
    .reduce<Uint16Array>(subdivide, Uint16Array.of(
      0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
      11, 10, 2, 5, 11, 4, 1, 5, 9, 7, 1, 8, 10, 7, 6,
      3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
      9, 8, 1, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7
    ))
    .reverse();

  for (let i = 0; i < vertices.length; i += 3) {
    const v1 = vertices[i + 0];
    const v2 = vertices[i + 1];
    const v3 = vertices[i + 2];
    const m = 1 / Math.sqrt(v1 * v1 + v2 * v2 + v3 * v3);
    vertices[i + 0] *= m;
    vertices[i + 1] *= m;
    vertices[i + 2] *= m;
  }

  return [vertices, triangles];
};

const getNormals = (a: vec3, b: vec3, c: vec3) =>
  vec3.normalize(vec3.create(), vec3.cross(vec3.create(),
    vec3.subtract(vec3.create(), b, a),
    vec3.subtract(vec3.create(), c, a),
  ));

const getExtrudedVertices = (vertices: Float32Array, indices: number[]): [number[], number[], number[]] => {
  const heightsE: number[] = [], verticesE: number[] = [], trianglesE: number[] = [];
  const counts: Record<string, number> = {};
  const map: Record<string, number> = {};
  const vl = vertices.length / 3;
  let t = vl;

  const getExtrudedVerticesOffset = (offset: number): number => {
    if (!map[offset]) {
      map[offset] = t++; t++;
      verticesE.push(
        vertices[3 * offset + 0] * EXTRUSION,
        vertices[3 * offset + 1] * EXTRUSION,
        vertices[3 * offset + 2] * EXTRUSION,
        vertices[3 * offset + 0] * EXTRUSION_HEIGHT,
        vertices[3 * offset + 1] * EXTRUSION_HEIGHT,
        vertices[3 * offset + 2] * EXTRUSION_HEIGHT,
      );
    }

    return map[offset];
  };

  const addEdgeOffsets = (o1: number, o2: number) => {
    heightsE.push(
      0, 0, 0,
      0, 0, 0,
    );

    trianglesE.push(
      map[o1] + 0, map[o2] + 1, map[o1] + 1,
      map[o1] + 0, map[o2] + 0, map[o2] + 1,
    );
  };

  for (let i = 0; i < indices.length; i += 4) {
    const o1 = getExtrudedVerticesOffset(indices[i + 0]);
    const o2 = getExtrudedVerticesOffset(indices[i + 1]);
    const o3 = getExtrudedVerticesOffset(indices[i + 2]);
    const n = (1 + indices[i + 3] * HEIGHT_MULTI);

    counts[indices[i + 0]] = counts[indices[i + 0]] + 1 || 1;
    counts[indices[i + 1]] = counts[indices[i + 1]] + 1 || 1;
    counts[indices[i + 2]] = counts[indices[i + 2]] + 1 || 1;

    verticesE[3 * (o1 - vl) + 3] *= n; verticesE[3 * (o1 - vl) + 4] *= n; verticesE[3 * (o1 - vl) + 5] *= n;
    verticesE[3 * (o2 - vl) + 3] *= n; verticesE[3 * (o2 - vl) + 4] *= n; verticesE[3 * (o2 - vl) + 5] *= n;
    verticesE[3 * (o3 - vl) + 3] *= n; verticesE[3 * (o3 - vl) + 4] *= n; verticesE[3 * (o3 - vl) + 5] *= n;

    heightsE.push(
      0, 0, 0,
      indices[i + 3], indices[i + 3], indices[i + 3],
    );

    trianglesE.push(
      o3 + 0, o2 + 0, o1 + 0,
      o1 + 1, o2 + 1, o3 + 1,
    );
  }

  for (let i = 0; i < indices.length; i += 4) {
    const a = indices[i + 0], b = indices[i + 1], c = indices[i + 2];

    if (counts[a] < 6 && counts[b] < 6) addEdgeOffsets(a, b);
    if (counts[b] < 6 && counts[c] < 6) addEdgeOffsets(b, c);
    if (counts[c] < 6 && counts[a] < 6) addEdgeOffsets(c, a);
  }

  return [verticesE, trianglesE, heightsE];
};

export default function getGeometry(): Geometry {
  const simplex = new SimplexNoise();
  const [vertices, triangles] = getIcosphere();
  const heights = new Float32Array(triangles.length);
  const extrusionIndices = [];

  for (let i = 0; i < triangles.length; i += 3) {
    const o1 = triangles[i + 0], o2 = triangles[i + 1], o3 = triangles[i + 2];
    const a = vec3.fromValues(vertices[3 * o1 + 0], vertices[3 * o1 + 1], vertices[3 * o1 + 2]);
    const b = vec3.fromValues(vertices[3 * o2 + 0], vertices[3 * o2 + 1], vertices[3 * o2 + 2]);
    const c = vec3.fromValues(vertices[3 * o3 + 0], vertices[3 * o3 + 1], vertices[3 * o3 + 2]);

    const norm = getNormals(a, b, c);
    const noise = simplex.noise3D(norm[0], norm[1], norm[2]);
    const noiseClamped = Math.min(noise, -0.001);

    heights[i + 0] = noiseClamped;
    heights[i + 1] = noiseClamped;
    heights[i + 2] = noiseClamped;

    if (noise >= 0) {
      extrusionIndices.push(o1, o2, o3, noise);
    }
  }


  const vl = vertices.length, tl = triangles.length;
  const [verticesE, trianglesE, heightsE] = getExtrudedVertices(vertices, extrusionIndices);
  const verticesM = new Float32Array(vl + verticesE.length);
  const trianglesF = new Uint16Array(tl + trianglesE.length);
  const heightsF = new Float32Array(tl + trianglesE.length);

  verticesM.set(vertices);
  verticesM.set(verticesE, vl);

  trianglesF.set(triangles);
  trianglesF.set(trianglesE, tl);

  heightsF.set(heights);
  heightsF.set(heightsE, tl);

  const normalsF = new Float32Array(trianglesF.length * 3);
  const verticesF = new Float32Array(trianglesF.length * 3);

  let max = verticesM[0];

  for (let i = 0; i < verticesM.length; i += 3) {
    const x = Math.abs(verticesM[i + 0] += random(JITTER, true));
    const y = Math.abs(verticesM[i + 1] += random(JITTER, true));
    const z = Math.abs(verticesM[i + 2] += random(JITTER, true));

    if (x > max) max = x;
    if (y > max) max = y;
    if (z > max) max = z;
  }

  const scale = Math.abs(1 / max);

  for (let i = 0; i < trianglesF.length; i += 3) {
    const o1 = trianglesF[i + 0], o2 = trianglesF[i + 1], o3 = trianglesF[i + 2];
    const a = vec3.fromValues(verticesM[3 * o1 + 0], verticesM[3 * o1 + 1], verticesM[3 * o1 + 2]);
    const b = vec3.fromValues(verticesM[3 * o2 + 0], verticesM[3 * o2 + 1], verticesM[3 * o2 + 2]);
    const c = vec3.fromValues(verticesM[3 * o3 + 0], verticesM[3 * o3 + 1], verticesM[3 * o3 + 2]);
    const norm = getNormals(a, b, c);

    [verticesF[3 * i + 0], verticesF[3 * i + 1], verticesF[3 * i + 2]] = vec3.scale(vec3.create(), a, scale);
    [verticesF[3 * i + 3], verticesF[3 * i + 4], verticesF[3 * i + 5]] = vec3.scale(vec3.create(), b, scale);
    [verticesF[3 * i + 6], verticesF[3 * i + 7], verticesF[3 * i + 8]] = vec3.scale(vec3.create(), c, scale);

    [normalsF[3 * i + 0], normalsF[3 * i + 1], normalsF[3 * i + 2]] = norm;
    [normalsF[3 * i + 3], normalsF[3 * i + 4], normalsF[3 * i + 5]] = norm;
    [normalsF[3 * i + 6], normalsF[3 * i + 7], normalsF[3 * i + 8]] = norm;

    trianglesF[i + 0] = i + 2;
    trianglesF[i + 1] = i + 1;
    trianglesF[i + 2] = i + 0;
  }

  return {
    elements: trianglesF,
    heights: heightsF,
    normals: normalsF,
    vertices: verticesF,
  };
}
