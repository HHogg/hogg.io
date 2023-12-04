import random from 'lodash/random';
import {
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Vec3 } from 'regl';
import { SpiralsContext, defaultPointsAlgorithm } from './useSpiralsContext';
import { PointAlgorithm, PointsAlgorithm, getPoints } from '.';

const hexToVec3 = (hex: string): Vec3 => {
  const [r, g, b] = hex
    .replace(/^#/, '')
    .match(/.{1,2}/g)!
    .map((hex) => parseInt(hex, 16) / 255);

  return [r, g, b];
};

const colorPallette: Vec3[] = [
  '#06FC9E',
  '#F9AB53',
  '#0DFDF9',
  '#FFFB8D',
  '#F569C4',
  '#B768FC',
].map(hexToVec3);

const getRandomColor = () => {
  return colorPallette[random(0, colorPallette.length - 1)];
};

const POINT_COUNT = 5000;

export default function SpiralsProvider({ children }: PropsWithChildren) {
  const [pointCount, setPointCount] = useState(POINT_COUNT);
  const [rotate, setRotate] = useState(true);
  const refPointAlgorithm = useRef<PointAlgorithm | null>(null);
  const [pointsAlgorithm, setPointsAlgorithm] = useState<PointsAlgorithm>(
    () => defaultPointsAlgorithm
  );

  const colors = useMemo(
    () => Array.from({ length: pointCount }).map(getRandomColor),
    [pointCount]
  );

  const points = useMemo(
    () => pointsAlgorithm(pointCount),
    [pointsAlgorithm, pointCount]
  );

  const handleSetPointsAlgorithm = useCallback((algorithm: PointsAlgorithm) => {
    setPointsAlgorithm(() => algorithm);
  }, []);

  const handleSetPointAlgorithm = useCallback(
    (algorithm: PointAlgorithm) => {
      if (refPointAlgorithm.current !== algorithm) {
        refPointAlgorithm.current = algorithm;
        handleSetPointsAlgorithm((n) => getPoints(n, algorithm));
      }
    },
    [handleSetPointsAlgorithm]
  );

  return (
    <SpiralsContext.Provider
      value={{
        colors,
        pointCount,
        points,
        rotate,
        setPointAlgorithm: handleSetPointAlgorithm,
        setPointsAlgorithm: handleSetPointsAlgorithm,
        setPointCount,
        setRotate,
      }}
    >
      {children}
    </SpiralsContext.Provider>
  );
}
