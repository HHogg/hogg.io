import * as React from 'react';
import random from 'lodash.random';
import data from '../../../data';
import { Flex, Text, useMatchMedia, useResizeObserver } from 'preshape';
import { Box, Circle, Vector, testPolygonCircle, testCircleCircle } from 'sat';
import { Algorithm } from './Algorithms';
import ProjectPage from '../../ProjectPage/ProjectPage';
import SpiralsControls, { algorithms } from './SpiralsControls';
import SpiralsVisual from './SpiralsVisual';

const hasNoCollision = (shapes: (null | Circle)[], shapeA: Circle) => {
  for (const shapeB of shapes) {
    if (shapeB && testCircleCircle(shapeA, shapeB)) {
      return false;
    }
  }

  return true;
};

const getPositions = (size: { height: number; width: number }, vectors: [number, number][], radii: number[], padding: number): ([number, number] | null)[] => {
  const bounds = new Box(new Vector(0, 0), size.width, size.height).toPolygon();
  const shapes = radii.reduce<(null | Circle)[]>((positions, radius) => {
    for (const vector of vectors) {
      const shape = new Circle(new Vector(...vector), radius + padding);

      if (testPolygonCircle(bounds, shape) && hasNoCollision(positions, shape)) {
        positions.push(shape);
        return positions;
      }
    }

    positions.push(null);

    return positions;
  }, []);

  return shapes.map((shape) => shape === null ? null : [shape.pos.x, shape.pos.y]);
};

const getRadii = (length: number) => Array
  .from({ length })
  .map(() => random(5, 30))
  .sort((a, b) => (Math.PI * (b * b)) - (Math.PI * (a * a)));

const getVectors = (config: Config, size: { height: number; width: number }) => {
  const spread = Math.max(0.05, Math.min(1, config.spread)) / 10;
  const h = size.height;
  const w = size.width;
  const [xDim, yDim] = config.proportional ? [w, h] : (w > h
    ? [w, w * config.aspectRatio]
    : [h, h * config.aspectRatio]);

  return config.algorithm({
    cover: config.cover,
    height: h,
    width: w,
    xCenter: (w / 2),
    xDistance: (xDim * (spread * (xDim / yDim))) * config.algorithm.NORMALISATION_FACTOR,
    yCenter: (h / 2),
    yDistance: (yDim * (spread * (yDim / xDim))) * config.algorithm.NORMALISATION_FACTOR,
  });
};

export interface Config {
  algorithm: Algorithm;
  algorithmName: string;
  aspectRatio: number;
  cover: boolean;
  padding: number;
  proportional: boolean;
  shapeCount: number;
  showShapes: boolean;
  showVectors: boolean;
  spread: number;
}

const defaultConfig: Config = {
  algorithm: algorithms[4][1],
  algorithmName: algorithms[4][0],
  aspectRatio: 1,
  cover: true,
  padding: 5,
  proportional: false,
  shapeCount: 100,
  showShapes: true,
  showVectors: true,
  spread: 0.05,
};

const Spirals = () => {
  const match = useMatchMedia(['600px']);
  const [size, ref] = useResizeObserver();
  const [radii, setRadii] = React.useState<number[]>(getRadii(defaultConfig.shapeCount));
  const [vectors, setVectors] = React.useState<[number, number][]>([]);
  const [positions, setPositions] = React.useState<[number, number, number][]>([]);
  const [config, setConfig] = React.useState<Config>(defaultConfig);

  React.useEffect(() => {
    setRadii(getRadii(config.showShapes ? config.shapeCount : 0));
  }, [config.shapeCount, config.showShapes]);

  React.useEffect(() => {
    const vectors = getVectors(config, size);
    const poisitions = getPositions(size, vectors, radii, config.padding)
      .map((p, i) => p ? [radii[i], ...p] : p)
      .filter((p): p is [number, number, number] => !!p);

    setPositions(poisitions);
    setVectors(vectors);
  }, [
    radii,
    size,
    config.algorithm,
    config.aspectRatio,
    config.cover,
    config.padding,
    config.proportional,
    config.spread,
  ]);

  return (
    <ProjectPage { ...data.projects.Spirals }>
      <Flex
          direction={ match('600px') ? 'horizontal' : 'vertical' }
          gap="x8"
          grow>
        <Flex
            alignChildrenVertical="end"
            backgroundColor="dark-shade-2"
            basis={ match('600px') ? 'none' : undefined }
            container
            direction="vertical"
            gap="x4"
            grow
            minHeight="35rem"
            padding="x4"
            textColor="light-shade-1">
          <Flex absolute="fullscreen" ref={ ref }>
            { !!(size.height && size.width) && (
              <SpiralsVisual
                  height={ size.height }
                  positions={ positions }
                  vectors={ config.showVectors ? vectors : [] }
                  width={ size.width } />
            ) }
          </Flex>

          <Flex container>
            <Text size="x1"><Text inline strong>Algorithm:</Text> { config.algorithmName }</Text>
            <Text size="x1"><Text inline strong>Aspect Ratio:</Text> { config.aspectRatio }</Text>
            <Text size="x1"><Text inline strong>Cover:</Text> { config.cover.toString() }</Text>
            <Text size="x1"><Text inline strong>Padding:</Text> { config.padding }</Text>
            <Text size="x1"><Text inline strong>Proportional:</Text> { config.proportional.toString() }</Text>
            <Text size="x1"><Text inline strong>Spread:</Text> { config.spread }</Text>
          </Flex>

          <Flex container>
            <Text size="x1">
              <Text inline strong>Vectors:</Text> { vectors.length || '-' }
            </Text>
          </Flex>
        </Flex>

        <Flex>
          <SpiralsControls
              config={ config }
              onConfigChange={ (update: Partial<Config>) => setConfig({ ...config, ...update }) } />
        </Flex>
      </Flex>
    </ProjectPage>
  );
};

export default Spirals;
