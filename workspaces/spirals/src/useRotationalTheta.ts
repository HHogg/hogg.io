import { useCallback, useRef } from 'react';

const DURATION_ROTATION = 10;

export default function useGetRotationalTheta() {
  const theta = useRef(0);

  const thetaLinear = useRef(0);
  const thetaTransition = useRef(0);

  const linearStartTime = useRef<number | null>(null);
  const linearT = useRef(0);

  return useCallback((transitionT: number, time: number) => {
    if (transitionT === 0) {
      thetaTransition.current = 0;
    }

    if (transitionT <= 1) {
      const a = transitionT * Math.PI * 2;
      const d = a - thetaTransition.current;

      thetaTransition.current = a;
      theta.current += d;
    }

    if (linearStartTime.current === null) {
      linearStartTime.current = time;
    }

    linearT.current = (time - linearStartTime.current) / DURATION_ROTATION;

    const a = linearT.current * Math.PI * 2;
    const d = a - thetaLinear.current;

    thetaLinear.current = a;
    theta.current += d;

    if (linearT.current >= 1) {
      thetaLinear.current = 0;
      linearStartTime.current = null;
    }

    return theta.current;
  }, []);
}
