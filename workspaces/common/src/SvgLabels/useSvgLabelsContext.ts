import { createContext, useContext } from 'react';
import { Label, Obstacle, Point } from './types';

export type SvgLabelsContextProps = {
  getLabelShift: (label: Label) => Point;
  registerLabel: (label: Label) => () => void;
  registerObstacle: (obstacle: Obstacle) => () => void;
};

export const SvgLabelsContext = createContext<SvgLabelsContextProps>({
  getLabelShift: () => [0, 0],
  registerLabel: () => () => {},
  registerObstacle: () => () => {},
});

export default function useSvgLabelsContext() {
  return useContext(SvgLabelsContext);
}
