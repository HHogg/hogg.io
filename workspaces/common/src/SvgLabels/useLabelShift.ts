import { useEffect } from 'react';
import { Label } from './types';
import useSvgLabelsContext from './useSvgLabelsContext';

export function useLabelShift(label: Label) {
  const { getLabelShift, registerLabel } = useSvgLabelsContext();

  useEffect(() => {
    return registerLabel(label);
  }, [registerLabel, label]);

  return getLabelShift(label);
}
