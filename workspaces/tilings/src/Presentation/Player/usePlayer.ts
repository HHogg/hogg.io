import {
  useWasmApi,
  addEventListener,
  PlayerStateSnapshot,
  Metrics,
  Result,
} from '@hogg/wasm';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNotationContext } from '../Notation/useNotationContext';
import useRenderOptions from '../Renderer/useRenderOptions';
import { useSettingsContext } from '../Settings/useSettingsContext';

export type Callbacks = {
  onEnd?: () => void;
};

export type UsePlayerProps = {
  callbacks?: Callbacks;
  playAtStart?: boolean;
};

export type UsePlayerResult = {
  play: () => void;
  pause: () => void;
  forward: () => void;
  backward: () => void;
  toStart: () => void;
  toEnd: () => void;
  reset: () => void;
  uid: string;
  error?: string;
  percent: number;
  snapshot: PlayerStateSnapshot;
  renderResult: Result | null;
  renderMetrics: Metrics | null;
};

const uid = 'tilings-player';

export const usePlayer = ({
  callbacks,
  playAtStart,
}: UsePlayerProps = {}): UsePlayerResult => {
  const { api } = useWasmApi();
  const {
    autoRotate,
    expansionPhases,
    featureToggles,
    colorMode,
    colorPalette,
    scaleMode,
    showLayers,
    speed,
  } = useSettingsContext();
  const { notation } = useNotationContext();
  const { onEnd } = callbacks || {};
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
  const isPlaying = snapshot.isPlaying;

  const refCurrentNotation = useRef('');
  const refUpdateRenderMetrics = useRef(true);

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
    if (playAtStart) {
      api.tilings.controlPlayerToStart([]);
      api.tilings.controlPlayerPlay([]);
    } else {
      api.tilings.controlPlayerPause([]);
      api.tilings.controlPlayerToEnd([]);
    }
  }, [api.tilings, playAtStart]);

  const updateNotation = useCallback(
    (notation: string) => {
      refUpdateRenderMetrics.current = true;
      api.tilings.setPlayerNotation([notation]);
      refCurrentNotation.current = notation;
      reset();
    },
    [api, reset]
  );

  useEffect(() => {
    api.tilings.startPlayer([uid]);

    return () => {
      api.tilings.stopPlayer([]);
    };
  }, [api]);

  useEffect(() => {
    refUpdateRenderMetrics.current = true;
    api.tilings.setPlayerExpansionPhases([expansionPhases]);
  }, [api, expansionPhases]);

  useEffect(() => {
    refUpdateRenderMetrics.current = true;
    api.tilings.setPlayerFeatureToggles([featureToggles]);
  }, [api, featureToggles]);

  useEffect(() => {
    refUpdateRenderMetrics.current = true;
    api.tilings.setPlayerRenderOptions([options]);
  }, [api, options]);

  useEffect(() => {
    api.tilings.setPlayerSpeed([speed]);
  }, [api, speed]);

  useEffect(() => {
    play();
  }, [play]);

  useEffect(() => {
    updateNotation(notation);
  }, [updateNotation, notation]);

  useEffect(() => {
    if (isPlaying && percent === 1) {
      onEnd?.();
    }
  }, [isPlaying, percent, onEnd]);

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

  return {
    play,
    pause,
    backward,
    forward,
    toStart,
    toEnd,
    reset,
    uid,
    error,
    percent,
    renderResult,
    renderMetrics,
    snapshot,
  };
};
