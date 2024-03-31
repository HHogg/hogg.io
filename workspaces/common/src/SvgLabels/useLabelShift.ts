import { useEffect } from 'react';
import { Label } from './types';
import useSvgLabelsContext from './useSvgLabelsContext';

type UseLabelShiftOpts = {
  isVisible?: boolean;
};

export function useLabelShift(label: Label, { isVisible }: UseLabelShiftOpts) {
  const { getLabelShift, registerLabel } = useSvgLabelsContext();

  useEffect(() => {
    if (isVisible) {
      return registerLabel(label);
    }
  }, [registerLabel, label, isVisible]);

  return getLabelShift(label);
}
