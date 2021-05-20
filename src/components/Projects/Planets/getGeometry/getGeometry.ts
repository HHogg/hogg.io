import pipe from 'ramda/src/pipe';
import { vec3 } from 'gl-matrix';
import getExtrusion from './getExtrusion';
import getFaceNormalGeometries from './getFaceNormalGeometries';
import getIcosphere from './getIcosphere';
import getJitteredGeometries from './getJitteredGeometries';
import getRawGeometries from './getRawGeometries';
import getRescaledGeometries from './getRescaledGeometries';
import getExplodedGeometries from './getExplodedGeometries';

export interface GeometryBase {
  elements?: vec3[];
  normals?: vec3[];
  vertices: vec3[];
}

export interface Geometry extends GeometryBase {

}

export type PointRaw = [number, number, number];

export interface GeometryRaw {
  elements?: PointRaw[];
  normals?: PointRaw[];
  vertices: PointRaw[];
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
