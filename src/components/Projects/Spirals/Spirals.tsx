import * as React from 'react';
import random from 'lodash.random';
import data from '../../../data';
import { Box, useMatchMedia, useResizeObserver } from 'preshape';
import { Box as Rect, Circle, Vector, testPolygonCircle, testCircleCircle } from 'sat';
import ProjectPage from '../../ProjectPage/ProjectPage';
import { TypeVector, TypeAlgorithm, FermatSpiral, ZeroSpiral } from './Algorithms';
import SpiralsControls from './SpiralsControls';
import SpiralsVisual from './SpiralsVisual';

const hasCollided = (shapes: Circle[], circleA: Circle) => {
  for (const circleB of shapes) {
    if (testCircleCircle(circleA, circleB)) {
      return true;
    }
  }

  return false;
};

const scale = (points: TypeVector[], r0: number): TypeVector[] => {
  let r1 = 1;

  for (const p of points) {
    if (p[0] > r1) r1 = p[0];
    if (p[1] > r1) r1 = p[1];
  }

  if (r1 < r0) {
    for (const p of points) {
      p[0] = p[0] * (r0 / r1);
      p[1] = p[1] * (r0 / r1);
    }
  }

  return points;
};

const getVectors = (config: Config, size: { height: number; width: number }) => {
  const bounds = new Rect(new Vector(size.width * -0.5, size.height * -0.5), size.width, size.height).toPolygon();
  const radii = Array.from({ length: config.shapeCount }).map(() => random(10, 80)).sort((a, b) => b - a);
  const points = config.algorithm(config.vectorCount);
  const pointsScaled = scale(points, Math.min(size.height, size.width) / 2);
  const vectors: TypeVector[] = [];
  const circles: Circle[] = [];

  if (config.showShapes) {
    for (const radius of radii) {
      for (const [x, y] of pointsScaled) {
        const circle = new Circle(new Vector(x, y), (radius / 4) + config.padding);
        const shouldPlace = testPolygonCircle(bounds, circle) && !hasCollided(circles, circle);

        if (shouldPlace) {
          circles.push(circle);
          vectors.push([x, y, radius]);
          break;
        }
      }
    }
  }

  for (let i = 0; i < (pointsScaled.length - circles.length); i++) {
    vectors.unshift(config.showVectors ? pointsScaled[i] : [0, 0, 0]);
  }

  return vectors;
};

export interface Config {
  algorithm: TypeAlgorithm;
  padding: number;
  shapeCount: number;
  showShapes: boolean;
  showVectors: boolean;
  vectorCount: number;
}

const defaultConfig: Config = {
  algorithm: FermatSpiral,
  padding: 5,
  shapeCount: 100,
  showShapes: true,
  showVectors: true,
  vectorCount: 5000,
};

const Spirals = () => {
  const match = useMatchMedia(['600px']);
  const [size, ref] = useResizeObserver();
  const [config, setConfig] = React.useState<Config>(defaultConfig);
  const [vectors, setState] = React.useState<TypeVector[]>(getVectors({
    ...config,
    algorithm: ZeroSpiral,
  }, size));

  React.useEffect(() => {
    setState(getVectors(config, size));
  }, [config, size]);

  return (
    <ProjectPage { ...data.projects.Spirals }>
      <Box
          flex={ match('600px') ? 'horizontal' : 'vertical' }
          gap="x8"
          grow>
        <Box
            alignChildrenVertical="end"
            backgroundColor="dark-shade-2"
            basis={ match('600px') ? '0' : undefined }
            flex="vertical"
            gap="x4"
            grow
            minHeight="35rem"
            padding="x4"
            textColor="light-shade-1">
          <Box container grow>
            <Box absolute="edge-to-edge" ref={ ref }>
              { !!(size.height && size.width) && (
                <SpiralsVisual
                    height={ size.height }
                    vectors={ vectors }
                    width={ size.width } />
              ) }
            </Box>
          </Box>
        </Box>

        <Box>
          <SpiralsControls
              config={ config }
              onConfigChange={ (update: Partial<Config>) =>
                setConfig({ ...config, ...update }) } />
        </Box>
      </Box>
    </ProjectPage>
  );
};

export default Spirals;
