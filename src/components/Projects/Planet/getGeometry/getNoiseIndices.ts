import SimplexNoise from 'simplex-noise';
import { vec4 } from 'gl-matrix';
import { Geometry } from './getGeometry';
import { getNormal } from './getFaceNormalGeometries';

const getNoiseIndices = ({ elements, vertices }: Geometry) => {
  const simplex = new SimplexNoise();
  const noises: vec4[] = [];

  if (elements) {
    for (const [a, b, c] of elements) {
      const normal = getNormal(vertices[a], vertices[b], vertices[c]);
      const noise = simplex.noise3D(normal[0], normal[1], normal[2]);

      if (noise >= 0) {
        noises.push(vec4.fromValues(a, b, c, noise));
      }
    }
  }

  return noises;
};

export default getNoiseIndices;
