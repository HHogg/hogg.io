import * as SAT from 'sat';
import { Circle, Obstacle, Rect, Obstacles, Line, Geometry } from '../types';

const isCircle = (geometry: Geometry): geometry is Circle =>
  (geometry as Circle).radius !== undefined;

const isRect = (geometry: Geometry): geometry is Rect =>
  (geometry as Rect).width !== undefined;

const isLine = (geometry: Geometry): geometry is Line =>
  (geometry as Line).x2 !== undefined;

const isObstacleCircle = (obstacle: Obstacle): obstacle is Obstacle<Circle> =>
  isCircle(obstacle.geometry);

const isObstacleRect = (obstacle: Obstacle): obstacle is Obstacle<Rect> =>
  isRect(obstacle.geometry);

const isObstacleLine = (obstacle: Obstacle): obstacle is Obstacle<Line> =>
  isLine(obstacle.geometry);

const circleToSATCircle = (circle: Circle, padding = 0) =>
  new SAT.Circle(new SAT.Vector(circle.x, circle.y), circle.radius + padding);

const rectToSATPolygon = (rect: Rect, padding = 0) =>
  new SAT.Box(
    new SAT.Vector(rect.x - padding, rect.y - padding),
    rect.width + padding * 2,
    rect.height + padding * 2
  ).toPolygon();

const lineToSATPolygon = (line: Line, padding = 0) => {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const theta = Math.atan2(dy, dx);

  // Calculate perpendicular vectors for padding
  const perpX = Math.cos(theta + Math.PI / 2) * padding;
  const perpY = Math.sin(theta + Math.PI / 2) * padding;

  // Create the four corners of the rectangle around the line
  // Order vertices counter-clockwise for proper SAT.js polygon
  const x1 = line.x1 + perpX;
  const y1 = line.y1 + perpY;
  const x2 = line.x2 + perpX;
  const y2 = line.y2 + perpY;
  const x3 = line.x2 - perpX;
  const y3 = line.y2 - perpY;
  const x4 = line.x1 - perpX;
  const y4 = line.y1 - perpY;

  return new SAT.Polygon(new SAT.Vector(0, 0), [
    new SAT.Vector(x1, y1),
    new SAT.Vector(x2, y2),
    new SAT.Vector(x3, y3),
    new SAT.Vector(x4, y4),
  ]);
};

const hasCollidedGeometry = (
  obstacle: Obstacle,
  test: (padding: number, response?: SAT.Response) => boolean
) => {
  const padding = obstacle.padding ?? 0;

  // With 'bounds' the polygon must be fully within
  // the obstacle (minus padding)
  if (obstacle.type === 'bounds') {
    const response = new SAT.Response();
    const collision = test(-padding, response);

    return !collision || response.bInA === false;
  }

  // With 'outline' the polygon must not touch the obstacle
  // edges. If the polygon is completely within the obstacle (minus the padding)
  // then it can't be touching the edges, and likewise if it's completely
  // outside the obstacle.
  if (obstacle.type === 'outline') {
    const response = new SAT.Response();
    const collision = test(-padding, response);

    if (collision && response.bInA) {
      return false;
    }
  }

  return test(padding);
};

const testGeometryToPolygon = (
  geometry: Geometry,
  obstacle: SAT.Polygon | SAT.Circle,
  response?: SAT.Response
): boolean => {
  if (isCircle(geometry)) {
    if (obstacle instanceof SAT.Circle) {
      return SAT.testCircleCircle(
        obstacle,
        circleToSATCircle(geometry),
        response
      );
    } else {
      return SAT.testPolygonCircle(
        obstacle,
        circleToSATCircle(geometry),
        response
      );
    }
  }

  if (isRect(geometry)) {
    if (obstacle instanceof SAT.Circle) {
      return SAT.testCirclePolygon(
        obstacle,
        rectToSATPolygon(geometry),
        response
      );
    } else {
      return SAT.testPolygonPolygon(
        obstacle,
        rectToSATPolygon(geometry),
        response
      );
    }
  }

  if (isLine(geometry)) {
    if (obstacle instanceof SAT.Circle) {
      return SAT.testCirclePolygon(
        obstacle,
        lineToSATPolygon(geometry),
        response
      );
    } else {
      return SAT.testPolygonPolygon(
        obstacle,
        lineToSATPolygon(geometry),
        response
      );
    }
  }

  return false;
};

const hasCollidedCircle = (
  geometry: Geometry,
  obstacle: Obstacle<Circle>
): boolean => {
  return hasCollidedGeometry(obstacle, (padding, response) =>
    testGeometryToPolygon(
      geometry,
      circleToSATCircle(obstacle.geometry, padding),
      response
    )
  );
};

const hasCollidedRect = (
  geometry: Geometry,
  obstacle: Obstacle<Rect>
): boolean => {
  return hasCollidedGeometry(obstacle, (padding, response) =>
    testGeometryToPolygon(
      geometry,
      rectToSATPolygon(obstacle.geometry, padding),
      response
    )
  );
};

const hasCollidedLine = (
  geometry: Geometry,
  obstacle: Obstacle<Line>
): boolean => {
  return hasCollidedGeometry(obstacle, (padding, response) =>
    testGeometryToPolygon(
      geometry,
      lineToSATPolygon(obstacle.geometry, padding),
      response
    )
  );
};

export const hasCollided = (geometry: Geometry, obstacles: Obstacles) => {
  for (const obstacle of obstacles) {
    if (isObstacleCircle(obstacle) && hasCollidedCircle(geometry, obstacle)) {
      return true;
    }

    if (isObstacleRect(obstacle) && hasCollidedRect(geometry, obstacle)) {
      return true;
    }

    if (isObstacleLine(obstacle) && hasCollidedLine(geometry, obstacle)) {
      return true;
    }
  }

  return false;
};
