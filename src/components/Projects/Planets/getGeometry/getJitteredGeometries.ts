import { vec3 } from 'gl-matrix';
import random from 'lodash.random';
import { GeometryBase } from './getGeometry';

const JITTER = 0.05;

const getJitteredPoint = (vec: vec3) =>
  vec3.add(vec3.create(), vec,
    vec3.fromValues(
      random(JITTER, true),
      random(JITTER, true),
      random(JITTER, true),
    )
  );

const getJitteredGeometries = (geometries: GeometryBase[]): GeometryBase[] =>
  geometries.map(({ elements, vertices }) => ({
    elements: elements,
    vertices: vertices.map(getJitteredPoint),
  }));

export default getJitteredGeometries;
