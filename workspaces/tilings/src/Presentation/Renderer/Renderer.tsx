import { DeepPartial } from '@hogg/common';
import { Flag, Options, useWasmApi } from '@hogg/wasm';
import merge from 'lodash/merge';
import {
  Box,
  BoxProps,
  Motion,
  Text,
  useResizeObserver,
  useThemeContext,
} from 'preshape';
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 } from 'uuid';
import { useArrangementContext } from '../Arrangement/useArrangementContext';
import { useNotationContext } from '../Notation/useNotationContext';
import {
  defaultExpansionPhases,
  getDefaultOptionsWithStyles,
} from './defaultOptions';

export type RendererProps = {
  expansionPhases?: number;
  options?: DeepPartial<Options>;
  scale?: number;
  validations?: Flag[];
  withPlayer?: boolean;
};

export default function Renderer({
  expansionPhases = defaultExpansionPhases,
  options: optionsProps,
  scale = 1,
  validations,
  ...rest
}: BoxProps & RendererProps) {
  const { colors: themeColors } = useThemeContext();
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const refCanvasTransferred = useRef<boolean>(false);
  const refUuid = useRef(v4());
  const [error, setError] = useState('');
  const { api } = useWasmApi();
  const { notation } = useNotationContext();
  const { tiling, setTiling, setRenderMetrics } = useArrangementContext();
  const [size, setSize] = useResizeObserver<HTMLDivElement>();
  const { height, width } = size;

  const defaultOptions = useMemo<Options>(
    () => getDefaultOptionsWithStyles(themeColors),
    [themeColors]
  );
  const options = useMemo<Options>(
    () => merge({}, defaultOptions, optionsProps),
    [defaultOptions, optionsProps]
  );

  // Transfer the canvas to the worker
  useEffect(() => {
    if (refCanvas.current && !refCanvasTransferred.current) {
      const offscreenCanvas = refCanvas.current.transferControlToOffscreen();
      api.transferCanvas([refUuid.current, offscreenCanvas], [offscreenCanvas]);
      refCanvasTransferred.current = true;
    }
  }, [api]);

  // Generate the tiling
  useEffect(() => {
    try {
      api
        .generateTiling([notation, expansionPhases, validations])
        .then(setTiling);
    } catch (error) {
      setError((error as Error).message);
    }
  }, [api, notation, expansionPhases, setError, setTiling, validations]);

  // Render the tiling
  useEffect(() => {
    try {
      const scaledWidth = width * window.devicePixelRatio * scale;
      const scaledHeight = height * window.devicePixelRatio * scale;

      if (!scaledWidth || !scaledHeight || !tiling) {
        return;
      }

      api
        .renderTiling([
          refUuid.current,
          tiling,
          scaledWidth,
          scaledHeight,
          options,
        ])
        .then(setRenderMetrics);
    } catch (error) {
      setError((error as Error).message);
    }
  }, [api, width, height, scale, tiling, options, setRenderMetrics]);

  return (
    <Box {...rest} flex="vertical" grow>
      <Box basis="0" container grow ref={setSize}>
        <Motion initial={{ scale: 1 }}>
          <Box
            absolute="edge-to-edge"
            ref={refCanvas}
            tag="canvas"
            style={{
              height: `${height * scale}px`,
              width: `${width * scale}px`,
              transformOrigin: 'top left',
              transform: `scale(${1 / scale})`,
            }}
          ></Box>
        </Motion>

        {error && (
          <Box absolute="center" maxWidth="300px">
            <Text
              align="middle"
              size="x3"
              textColor="negative-shade-4"
              weight="x2"
            >
              {error}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
