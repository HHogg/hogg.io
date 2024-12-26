import { useWasmApi } from '@hogg/wasm';
import { BoxProps, useResizeObserver } from 'preshape';
import { useEffect } from 'react';
import { usePlayerContext } from '../Player/usePlayerContext';
import Canvas from './Canvas';

export default function RendererPlayer(props: BoxProps) {
  const { api } = useWasmApi();
  const { uid, error } = usePlayerContext();
  const [size, refSize] = useResizeObserver<HTMLDivElement>();
  const { height, width } = size;

  useEffect(() => {
    api.tilings.setPlayerCanvasSize([
      uid,
      width * window.devicePixelRatio,
      height * window.devicePixelRatio,
    ]);
  }, [api, uid, width, height]);

  return (
    <Canvas
      {...props}
      uid={uid}
      error={error}
      height={height}
      ref={refSize}
      width={width}
    />
  );
}
