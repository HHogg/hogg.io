import getGeometry from './getGeometry';

global.onmessage = (() => {
  try {
    postMessage(getGeometry());
  } catch (error) {
    postMessage({
      error: error,
      heights: [],
      normals: [],
      triangles: [],
      vertices: [],
      vertexMax: [],
      vertexMin: [],
    });
  }
});
