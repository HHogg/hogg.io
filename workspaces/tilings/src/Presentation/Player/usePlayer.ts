import { useCallback, useEffect, useRef, useState } from 'react';
import { useArrangementContext } from '../Arrangement/useArrangementContext';
import { useNotationContext } from '../Notation/useNotationContext';

const DURATION = 8_000;

export type Speed = 0.25 | 0.5 | 1 | 1.5 | 2;
export const SPEEDS: Speed[] = [0.25, 0.5, 1, 1.5, 2];

export type UsePlayerOptions = {
  isPlaying: boolean;
  speed: Speed;
};

export type UsePlayerResult = UsePlayerOptions & {
  play: () => void;
  pause: () => void;
  forward: () => void;
  backward: () => void;
  setSpeed: (speed: Speed) => void;
  toStart: () => void;
  toEnd: () => void;
  elapsed: number;
  maxStage?: number;
};

export const defaultOptions: UsePlayerOptions = {
  isPlaying: false,
  speed: 1,
};

export const usePlayer = (
  opts: Partial<UsePlayerOptions> = {}
): UsePlayerResult => {
  const initialState = {
    ...defaultOptions,
    ...opts,
  };

  const { tiling } = useArrangementContext();
  const { notation } = useNotationContext();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speed, setSpeed] = useState<Speed>(initialState.speed);
  const [isPlaying, setIsPlaying] = useState(initialState.isPlaying);

  const refAnimationFrameRequest = useRef<number>();
  const refTimeout = useRef<NodeJS.Timeout>();

  const stages = tiling?.polygons.stages ?? 0;
  const duration = DURATION / speed;
  const durationOnEachStage = Math.min(duration / Math.max(1, stages));
  const elapsed = duration > 1 ? Math.min(1, elapsedTime / duration) : 0;

  const getActiveStage = useCallback(
    (elapsedTime: number) => {
      if (Number.isFinite(elapsedTime) === false) {
        return undefined;
      }

      const elapsedStage = elapsedTime / durationOnEachStage;
      const activePartIndex = Math.floor(elapsedStage);

      return activePartIndex;
    },
    [durationOnEachStage]
  );

  const handleNextStage = useCallback(() => {
    setElapsedTime((prevElapsedTime) => {
      const activePart = getActiveStage(prevElapsedTime);

      if (activePart === undefined) {
        return 0;
      }

      const nextPart = activePart + 1;

      if (nextPart >= stages) {
        return 0;
      }

      return (nextPart * durationOnEachStage) % duration;
    });
  }, [duration, durationOnEachStage, stages, getActiveStage]);

  const handlePreviousStage = useCallback(() => {
    setElapsedTime((prevElapsedTime) => {
      let activePart = getActiveStage(prevElapsedTime);

      if (activePart === undefined) {
        activePart = stages;
      }

      const nextPart = activePart - 1;

      if (nextPart < 0) {
        return (stages - 1) * durationOnEachStage;
      }

      return (nextPart * durationOnEachStage) % duration;
    });
  }, [duration, durationOnEachStage, stages, getActiveStage]);

  const stopLoop = () => {
    if (refAnimationFrameRequest.current) {
      window.cancelAnimationFrame(refAnimationFrameRequest.current);
    }

    if (refTimeout.current) {
      window.clearTimeout(refTimeout.current);
    }
  };

  const startLoop = useCallback(() => {
    let lastTime = Date.now();

    const tick = () => {
      const timeNow = Date.now();
      const delta = timeNow - lastTime;

      lastTime = timeNow;

      setElapsedTime((elapsedTime) => {
        if (elapsedTime >= duration) {
          return 0;
        }

        return (elapsedTime += delta);
      });

      refTimeout.current = setTimeout(() => {
        refAnimationFrameRequest.current = requestAnimationFrame(tick);
      }, 1000 / 60);
    };

    stopLoop();
    tick();
  }, [duration]);

  const play = () => {
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const forward = () => {
    setIsPlaying(false);
    handleNextStage();
  };

  const backward = () => {
    setIsPlaying(false);
    handlePreviousStage();
  };

  const toStart = () => {
    setIsPlaying(false);
    setElapsedTime(0);
  };

  const toEnd = () => {
    setIsPlaying(false);
    setElapsedTime(duration);
  };

  useEffect(() => {
    if (isPlaying) {
      startLoop();
    }

    return () => {
      stopLoop();
    };
  }, [isPlaying, startLoop]);

  useEffect(() => {
    if (initialState.isPlaying) {
      setElapsedTime(0);
    } else {
      setElapsedTime(duration);
    }
  }, [initialState.isPlaying, duration]);

  useEffect(() => {
    if (isPlaying) {
      setElapsedTime(0);
    } else {
      setElapsedTime(duration);
    }
  }, [notation, isPlaying, duration]);

  return {
    backward,
    forward,
    pause,
    play,
    setSpeed,
    toStart,
    toEnd,
    elapsed,
    isPlaying,
    maxStage: getActiveStage(elapsedTime),
    speed,
  };
};
