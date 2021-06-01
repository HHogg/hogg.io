import pipe from 'ramda/src/pipe';
import { vec3 } from 'gl-matrix';
import getExtrusion from './getExtrusion';
import getFaceNormalGeometries from './getFaceNormalGeometries';
import getIcosphere from './getIcosphere';
import getJitteredGeometries from './getJitteredGeometries';
import getRawGeometries from './getRawGeometries';
import getRescaledGeometries from './getRescaledGeometries';
import getExplodedGeometries from './getExplodedGeometries';

export interface Geometry {
  name: string;
  elements?: vec3[];
  normals?: vec3[];
  vertices: vec3[];
  meta?: Record<string, any>;
}

export type Vec2Raw = [number, number];
export type Vec3Raw = [number, number, number];

export interface GeometryRaw {
  name: string;
  elements?: Vec3Raw[];
  normals?: Vec3Raw[];
  vertices: Vec3Raw[];
  meta?: Record<string, any>;
}

const getGeometry = (): GeometryRaw[] => {
  const icosphereBase = getIcosphere(4);
  const extrusionBase = getExtrusion(icosphereBase);

  return pipe(
    getJitteredGeometries,
    getRescaledGeometries,
    getExplodedGeometries,
    getFaceNormalGeometries,
    getRawGeometries,
  )([
    icosphereBase,
    extrusionBase,
  ]);
};

export default getGeometry;
