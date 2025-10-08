import { useEffect } from 'react';
import { Label } from './types';
import useSvgLabelsContext from './useSvgLabelsContext';

type UseLabelShiftOpts = {
  isVisible?: boolean;
};

export function useLabelShift(label: Label, { isVisible }: UseLabelShiftOpts) {
  const { getLabelShift, registerLabel, updateLabel } = useSvgLabelsContext();

  useEffect(() => {
    if (isVisible) {
      return registerLabel(label.id);
    }
  }, [registerLabel, label.id, isVisible]);

  useEffect(() => {
    updateLabel(label);
  }, [updateLabel, label]);

  return getLabelShift(label.id);
}
