import { DeepPartial } from '@hogg/common';
import { Options, useWasmApi } from '@hogg/wasm';
import { BoxProps, useResizeObserver } from 'preshape';
import { useEffect, useState } from 'react';
import { useNotationContext } from '../Notation/useNotationContext';
import Canvas from './Canvas';
import { defaultExpansionPhases } from './defaultOptions';
import useRenderOptions from './useRenderOptions';

export type RendererProps = {
  expansionPhases?: number;
  options?: DeepPartial<Options>;
  uid: string;
  height?: number;
  width?: number;
};

export default function Renderer({
  expansionPhases = defaultExpansionPhases,
  options: optionsProps,
  uid,
  height: heightProps,
  width: widthProps,
  ...rest
}: BoxProps & RendererProps) {
  const { api } = useWasmApi();
  const options = useRenderOptions(optionsProps);
  const { notation } = useNotationContext();
  const [error, setError] = useState('');
  const [size, refSize] = useResizeObserver<HTMLDivElement>();

  const height = heightProps || size.height || 0;
  const width = widthProps || size.width || 0;

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
        options,
      ]);
    } catch (error) {
      setError((error as Error).message);
    }
  }, [api, uid, height, width, notation, options, expansionPhases]);

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
