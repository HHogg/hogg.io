import { createContext, useContext } from 'react';
import { Label, Obstacle } from './types';
import {
  LabelShiftResult,
  createDefaultShiftResult,
} from './utils/getLabelShifts';

export type SvgLabelsContextProps = {
  getLabelShift: (label: Label) => LabelShiftResult;
  registerLabel: (label: Label) => () => void;
  registerObstacle: (obstacle: Obstacle) => () => void;
};

export const SvgLabelsContext = createContext<SvgLabelsContextProps>({
  getLabelShift: createDefaultShiftResult,
  registerLabel: () => () => {},
  registerObstacle: () => () => {},
});

export default function useSvgLabelsContext() {
  return useContext(SvgLabelsContext);
}
