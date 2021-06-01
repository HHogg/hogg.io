import { vec3 } from 'gl-matrix';
import flatten from 'lodash.flatten';
import random from 'lodash.random';
import csg from 'csg';
import incrementalConvexHull from 'incremental-convex-hull';
import voronoiDiagram, { Vector } from 'voronoi-diagram';
import { Geometry } from './getGeometry';

const FRACTURE_SIZE = 4;
const CUBE_SIZE = 1.5;
const RANDOMNESS = 0.5;

const getVoronoiGeometry = (points: Vector[]): [number[], Geometry] => {
  const voronoi = voronoiDiagram(points);
  const [elements, vertices, cells] = voronoi.cells.reduce<[vec3[], vec3[], number[]]>(([elements, vertices, cells], vCells) => {
    if (vCells.indexOf(-1) === -1){
      const points = vCells.map((v) => voronoi.positions[v]);

      for (const point of points) {
        for (const v of point) {
          if (v < -CUBE_SIZE || v > CUBE_SIZE) {
            return [elements, vertices, cells];
          }
        }
      }


      cells.push(vertices.length);
      vertices.push(...points.map(([a, b, c]) => vec3.fromValues(a, b, c)));
      elements.push(...incrementalConvexHull(points)
        .map(([a, b, c]) => vec3.fromValues(
          a + vertices.length - points.length,
          b + vertices.length - points.length,
          c + vertices.length - points.length
        )));
    }

    return [elements, vertices, cells];
  }, [[], [], []]);

  return [cells, {
    name: 'Voronoi',
    elements: elements,
    vertices: vertices,
  }];
};


const getExplodedGeometry = (geometry: Geometry, voronoiGeometry: Geometry, voronoiCells: number[]): Geometry[] => {
  const voronoiPolys = voronoiCells.map((cellStart, index) => voronoiGeometry.vertices.slice(cellStart, voronoiCells[index + 1]))
  const geometryPoly = csg.fromPolygons(geometry.elements?.map(([a, b, c]) => new csg.Polygon([
    new csg.
  ])));

  // const explodedPolys = voronoiPolys.map((poly) => {
  //   const a = csg.
  // });






  // const explodedPoints = voronoiPolys.map((points) => geometry.vertices.filter((point) => isPointInsidePolyhedron(point, points)));

  // const grouped =


  // console.log(points);





  return [geometry];
};

const getExplodedGeometries = (geometries: Geometry[]): Geometry[] => {
  const step = (2 / FRACTURE_SIZE);
  const points: Vector[] = [];

  for (let z = -CUBE_SIZE - RANDOMNESS + (step * 0.5); z < CUBE_SIZE + RANDOMNESS; z += step) {
    for (let y = -CUBE_SIZE - RANDOMNESS + (step * 0.5); y < CUBE_SIZE + RANDOMNESS; y += step) {
      for (let x = -CUBE_SIZE - RANDOMNESS + (step * 0.5); x < CUBE_SIZE + RANDOMNESS; x += step) {
        points.push([
          x * random(1 - RANDOMNESS, 1 + RANDOMNESS, true),
          y * random(1 - RANDOMNESS, 1 + RANDOMNESS, true),
          z * random(1 - RANDOMNESS, 1 + RANDOMNESS, true),
        ]);
      }
    }
  }

  const [voronoiCells, voronoiGeometry] = getVoronoiGeometry(points);
  const explodedGeometries = flatten(geometries.map((geometry) => getExplodedGeometry(geometry, voronoiGeometry, voronoiCells)));

  return [
    ...explodedGeometries,
    voronoiGeometry,
  ];
};


export default getExplodedGeometries;
