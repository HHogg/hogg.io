import random from 'lodash.random';
import {
  Box as Rect,
  Circle,
  Vector,
  testPolygonCircle,
  testCircleCircle,
} from 'sat';
import { TypeVector, ZeroSpiral } from './Algorithms';
import { Config } from './Spirals';

export type TypeVectorWithSize = [number, number, number];

export const hasCollided = (shapes: Circle[], circleA: Circle) => {
  for (const circleB of shapes) {
    if (testCircleCircle(circleA, circleB)) {
      return true;
    }
  }

  return false;
};

export const scale = (points: TypeVector[], r0: number): TypeVector[] => {
  return points.map(([x, y]) => [x * r0 * 0.5, y * r0 * 0.5]);
};

export const getVectors = (
  config: Config,
  size: { height: number; width: number }
): TypeVectorWithSize[] => {
  const bounds = new Rect(
    new Vector(size.width * -0.5, size.height * -0.5),
    size.width,
    size.height
  ).toPolygon();
  const radii = Array.from({ length: config.shapeCount })
    .map(() => random(5, 15))
    .sort((a, b) => b - a);

  const points = config.algorithm(config.vectorCount);
  const pointsScaled = scale(points, Math.min(size.height, size.width));
  const vectors: TypeVectorWithSize[] = [];
  const circles: Circle[] = [];

  pointsScaled.sort((a, b) => Math.hypot(...a) + Math.hypot(...b));

  if (
    config.showShapes &&
    config.algorithm !== ZeroSpiral &&
    size.height > 0 &&
    size.width > 0
  ) {
    for (const radius of radii) {
      for (const [x, y] of pointsScaled) {
        const circle = new Circle(new Vector(x, y), radius + config.padding);
        const shouldPlace =
          testPolygonCircle(bounds, circle) && !hasCollided(circles, circle);

        if (shouldPlace) {
          circles.push(circle);
          vectors.push([circle.pos.x, circle.pos.y, radius]);
          break;
        }
      }
    }
  }

  for (let i = 0; i < pointsScaled.length - circles.length; i++) {
    vectors.push(config.showVectors ? [...pointsScaled[i], 1] : [0, 0, 0]);
  }

  return vectors;
};
