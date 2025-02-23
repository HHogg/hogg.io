import {
  useWasmApi,
  addEventListener,
  PlayerStateSnapshot,
  Metrics,
  Result,
  Options,
} from '@hogg/wasm';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useRenderOptions from '../Renderer/useRenderOptions';
import { useSettingsContext } from '../Settings/useSettingsContext';

export type UsePlayerProps = {
  uid: string;
  expansionPhases?: number;
  options?: Options;
};

export type UsePlayerResult = {
  play: () => void;
  pause: () => void;
  forward: () => void;
  backward: () => void;
  toStart: () => void;
  toEnd: () => void;
  updateNotation: (notation: string) => void;
  reset: () => void;
  uid: string;
  error?: string;
  percent: number;
  snapshot: PlayerStateSnapshot;
  renderResult: Result | null;
  renderMetrics: Metrics | null;
};

export type Callbacks = {
  onEnd?: () => void;
};

const uid = 'tilings-player';

export const usePlayer = (callbacks: Callbacks = {}): UsePlayerResult => {
  const { api } = useWasmApi();
  const {
    autoRotate,
    expansionPhases,
    colorMode,
    colorPalette,
    scaleMode,
    showLayers,
    speed,
  } = useSettingsContext();

  const options = useRenderOptions(
    useMemo(
      () => ({
        autoRotate,
        colorMode,
        colorPalette,
        scaleMode,
        showLayers,
      }),
      [autoRotate, colorMode, colorPalette, scaleMode, showLayers]
    )
  );

  const [snapshot, setSnapshot] = useState<PlayerStateSnapshot>({
    drawIndex: 0,
    intervalMs: 0,
    isLooping: false,
    isPlaying: false,
    maxIndex: 0,
  });

  const [error, setError] = useState('');
  const [percent, setPercent] = useState(0);
  const [renderResult, setRenderResult] = useState<Result | null>(null);
  const [renderMetrics, setRenderMetrics] = useState<Metrics | null>(null);
  const refUpdateRenderMetrics = useRef(true);
  const isPlaying = snapshot.isPlaying;

  const updateNotation = useCallback(
    (notation: string) => {
      refUpdateRenderMetrics.current = true;
      api.tilings.setPlayerNotation([notation]);
    },
    [api]
  );

  useEffect(() => {
    api.tilings.startPlayer([uid]);

    return () => {
      api.tilings.stopPlayer([]);
    };
  }, [api]);

  useEffect(() => {
    api.tilings.setPlayerExpansionPhases([expansionPhases]);
  }, [api, expansionPhases]);

  useEffect(() => {
    api.tilings.setPlayerRenderOptions([options]);
  }, [api, options]);

  useEffect(() => {
    api.tilings.setPlayerSpeed([speed]);
  }, [api, speed]);

  useEffect(() => {
    return addEventListener('error', ({ data }) => {
      setError(data.message);
    });
  }, []);

  useEffect(() => {
    return addEventListener('player', ({ data }) => {
      setPercent(data.drawIndex / data.maxIndex);
      setSnapshot(data);
    });
  }, []);

  useEffect(() => {
    return addEventListener('draw', ({ data }) => {
      if (!refUpdateRenderMetrics.current) {
        return;
      }

      refUpdateRenderMetrics.current = false;
      setRenderMetrics(data.metrics);
    });
  }, []);

  useEffect(() => {
    return addEventListener('render', ({ data }) => {
      setRenderResult(data.result);
    });
  }, []);

  const play = useCallback(() => api.tilings.controlPlayerPlay([]), [api]);
  const pause = useCallback(() => api.tilings.controlPlayerPause([]), [api]);
  const forward = useCallback(
    () => api.tilings.controlPlayerStepForward([]),
    [api]
  );
  const backward = useCallback(
    () => api.tilings.controlPlayerStepBackward([]),
    [api]
  );
  const toStart = useCallback(
    () => api.tilings.controlPlayerToStart([]),
    [api]
  );
  const toEnd = useCallback(() => api.tilings.controlPlayerToEnd([]), [api]);

  const reset = useCallback(() => {
    pause();
    toEnd();
  }, [toEnd, pause]);

  useEffect(() => {
    play();
  }, [play]);

  useEffect(() => {
    if (isPlaying && percent === 1 && callbacks.onEnd) {
      callbacks.onEnd();
    }
  }, [callbacks, percent, isPlaying]);

  return {
    play,
    pause,
    backward,
    forward,
    toStart,
    toEnd,
    updateNotation,
    reset,
    uid,
    error,
    percent,
    renderResult,
    renderMetrics,
    snapshot,
  };
};
