import { useCallback, useRef } from 'react';
import ease from './ease';

const DURATION_TRANSITION = 2;

export default function useTransitionT() {
  const transitionT = useRef<number>(1);
  const transitionTimeStart = useRef<number | null>(null);

  const updateTransitionT = useCallback((time: number) => {
    if (transitionTimeStart.current === null) {
      transitionTimeStart.current = time;
    }

    transitionT.current = ease(
      Math.min((time - transitionTimeStart.current) / DURATION_TRANSITION, 1)
    );
  }, []);

  const resetTransitionT = useCallback(() => {
    transitionT.current = 0;
    transitionTimeStart.current = null;
  }, []);

  return {
    transitionT,
    updateTransitionT,
    resetTransitionT,
  };
}
