import { DeepPartial } from '@hogg/common';
import { FeatureToggle, Options, useWasmApi } from '@hogg/wasm';
import { BoxProps, useResizeObserver } from 'preshape';
import { useEffect, useState } from 'react';
import { useNotationContext } from '../Notation/useNotationContext';
import Canvas from './Canvas';
import { defaultRepetitions } from './defaultOptions';
import useRenderOptions from './useRenderOptions';

export type RendererProps = {
  featureToggles?: Record<FeatureToggle, boolean>;
  height?: number;
  notation?: string;
  options?: DeepPartial<Options>;
  repetitions?: number;
  square?: boolean;
  uid: string;
  width?: number;
};

export default function Renderer({
  featureToggles,
  height: heightProps,
  notation: notationProps,
  options: optionsProps,
  repetitions = defaultRepetitions,
  square,
  uid,
  width: widthProps,
  ...rest
}: BoxProps & RendererProps) {
  const { api } = useWasmApi();
  const options = useRenderOptions(optionsProps);
  const { notation: notationContext } = useNotationContext();
  const [error, setError] = useState('');
  const [size, refSize] = useResizeObserver<HTMLDivElement>();

  const notation = notationProps || notationContext;

  let height = heightProps || size.height || 0;
  let width = widthProps || size.width || 0;

  if (square) {
    height = Math.max(height, width);
    width = height;
  }

  useEffect(() => {
    try {
      const scaledWidth = width * window.devicePixelRatio;
      const scaledHeight = height * window.devicePixelRatio;

      if (!scaledWidth || !scaledHeight || !notation) {
        return;
      }

      api.tilings.renderTiling([
        uid,
        notation,
        scaledWidth,
        scaledHeight,
        repetitions,
        featureToggles,
        options,
      ]);
    } catch (error) {
      setError((error as Error).message);
    }
  }, [api, uid, height, width, notation, options, repetitions, featureToggles]);

  return (
    <Canvas
      {...rest}
      uid={uid}
      error={error}
      height={height}
      ref={refSize}
      width={width}
    />
  );
}
