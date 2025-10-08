import { createContext, useContext } from 'react';
import { Label, Obstacle } from './types';
import { LabelShiftResult } from './utils/getLabelShifts';

export type SvgLabelsContextProps = {
  getLabelShift: (id: string) => LabelShiftResult;
  updateLabel: (label: Label) => void;
  registerLabel: (id: string) => () => void;
  registerObstacle: (obstacle: Obstacle) => () => void;
};

const notImplemented = () => {
  throw new Error('SvgLabelsContext not initialized');
};

export const SvgLabelsContext = createContext<SvgLabelsContextProps>({
  getLabelShift: notImplemented,
  updateLabel: notImplemented,
  registerLabel: notImplemented,
  registerObstacle: notImplemented,
});

export default function useSvgLabelsContext() {
  return useContext(SvgLabelsContext);
}
