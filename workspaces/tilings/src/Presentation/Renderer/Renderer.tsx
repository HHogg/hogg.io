import { DeepPartial } from '@hogg/common';
import { FeatureToggle, Options, useWasmApi } from '@hogg/wasm';
import { BoxProps, useResizeObserver } from 'preshape';
import { useEffect, useState } from 'react';
import { useNotationContext } from '../Notation/useNotationContext';
import Canvas from './Canvas';
import { defaultExpansionPhases } from './defaultOptions';
import useRenderOptions from './useRenderOptions';

export type RendererProps = {
  notation?: string;
  expansionPhases?: number;
  featureToggles?: Record<FeatureToggle, boolean>;
  options?: DeepPartial<Options>;
  uid: string;
  height?: number;
  width?: number;
  square?: boolean;
};

export default function Renderer({
  notation: notationProps,
  expansionPhases = defaultExpansionPhases,
  featureToggles,
  options: optionsProps,
  uid,
  height: heightProps,
  width: widthProps,
  square,
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
        expansionPhases,
        featureToggles,
        options,
      ]);
    } catch (error) {
      setError((error as Error).message);
    }
  }, [
    api,
    uid,
    height,
    width,
    notation,
    options,
    expansionPhases,
    featureToggles,
  ]);

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
