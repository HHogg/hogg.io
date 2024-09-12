import { useMemo, useRef } from 'react';

export default function useAverage(value = 0): number {
  const refAverage = useRef<number>(value);

  return useMemo(() => {
    if (value === undefined) {
      return refAverage.current;
    }

    refAverage.current = (refAverage.current + value) / 2;
    return refAverage.current;
  }, [value]);
}
