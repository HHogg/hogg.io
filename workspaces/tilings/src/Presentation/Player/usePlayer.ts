import {
  useWasmApi,
  addEventListener,
  PlayerStateSnapshot,
  Metrics,
  Result,
  Options,
} from '@hogg/wasm';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNotationContext } from '../Notation/useNotationContext';
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
  uid: string;
  error?: string;
  percent: number;
  snapshot: PlayerStateSnapshot;
  renderResult: Result | null;
  renderMetrics: Metrics | null;
};

const uid = 'tilings-player';

export const usePlayer = (): UsePlayerResult => {
  const { api } = useWasmApi();
  const { notation } = useNotationContext();
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
    api.tilings.setPlayerNotation([notation]);
  }, [api, notation]);

  useEffect(() => {
    api.tilings.setPlayerRenderOptions([options]);
  }, [api, options]);

  useEffect(() => {
    refUpdateRenderMetrics.current = true;
    api.tilings.setPlayerNotation([notation]);
  }, [api, notation]);

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

  const play = () => api.tilings.controlPlayerPlay([]);
  const pause = () => api.tilings.controlPlayerPause([]);
  const forward = () => api.tilings.controlPlayerStepForward([]);
  const backward = () => api.tilings.controlPlayerStepBackward([]);
  const toStart = () => api.tilings.controlPlayerToStart([]);
  const toEnd = () => api.tilings.controlPlayerToEnd([]);

  return {
    play,
    pause,
    backward,
    forward,
    toStart,
    toEnd,
    uid,
    error,
    percent,
    renderResult,
    renderMetrics,
    snapshot,
  };
};
