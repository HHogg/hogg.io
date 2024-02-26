import { createContext, useContext } from 'react';
import { Vec3 } from 'regl';
import {
  Point,
  PointAlgorithm,
  PointsAlgorithm,
  getPoints,
  pointAlgorithmFermatSpiral,
} from './algorithms';

export const defaultPointsAlgorithm: PointsAlgorithm = (n) =>
  getPoints(n, pointAlgorithmFermatSpiral);

type SpiralsContextProps = {
  colors: Vec3[];
  points: Point[];
  pointCount: number;
  rotate: boolean;
  setPointAlgorithm: (algorithm: PointAlgorithm) => void;
  setPointsAlgorithm: (algorithm: PointsAlgorithm) => void;
  setPointCount: (count: number) => void;
  setRotate: (rotate: boolean) => void;
};

export const SpiralsContext = createContext<SpiralsContextProps>({
  colors: [],
  points: [],
  pointCount: 7_500,
  rotate: true,
  setPointAlgorithm: () => {},
  setPointsAlgorithm: () => {},
  setPointCount: () => {},
  setRotate: () => {},
});

export const useSpiralsContext = () => useContext(SpiralsContext);
