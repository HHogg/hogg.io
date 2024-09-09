import { useWasmApi } from '@hogg/wasm';
import {
  Box,
  BoxProps,
  Motion,
  Text,
  colorBlack,
  colorNegativeShade4,
  useResizeObserver,
  useThemeContext,
} from 'preshape';
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 } from 'uuid';
import { ColorMode, Options, ValidationFlag } from '../../types';
import { useArrangementContext } from '../Arrangement/useArrangementContext';
import { useNotationContext } from '../Notation/useNotationContext';
import { usePlayerContext } from '../Player/usePlayerContext';
import { useSettingsContext } from '../Settings/useSettingsContext';

export type RendererProps = {
  options?: Partial<Options>;
  scale?: number;
  shadow?: boolean;
  validations?: ValidationFlag[];
  withPlayer?: boolean;
};

export default function Renderer({
  options: optionsProp,
  scale = 1,
  shadow,
  validations,
  withPlayer = false,
  ...rest
}: BoxProps & RendererProps) {
  const { colors: themeColors, theme } = useThemeContext();
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const refCanvasTransferred = useRef<boolean>(false);
  const refUuid = useRef(v4());
  const [error, setError] = useState('');
  const { api, loading } = useWasmApi();
  const { notation } = useNotationContext();
  const { setTiling } = useArrangementContext();
  const { isPlaying, maxStage } = usePlayerContext(withPlayer);
  const {
    autoRotate,
    expansionPhases,
    colorMode,
    scaleMode,
    scaleSize,
    showAnnotations,
    showDebug,
  } = useSettingsContext();
  const [size, setSize] = useResizeObserver<HTMLDivElement>();
  const { height, width } = size;

  const showLoading = !isPlaying && loading.renderNotation;

  const options = useMemo<Options>(
    () => ({
      autoRotate,
      colorMode,
      expansionPhases,
      maxStage,
      showAnnotations,
      showDebug,
      padding: 10,
      scaleMode,
      scaleSize,
      ...optionsProp,
      styles: {
        axis: {
          fill: themeColors.colorTextShade1,
          lineThickness: 3,
          pointRadius: 6,
          strokeColor: themeColors.colorBackgroundShade1,
          strokeWidth: 2,
          ...optionsProp?.styles?.axis,
        },
        debug: {
          strokeColor: colorNegativeShade4,
          strokeWidth: 2,
          ...optionsProp?.styles?.debug,
        },
        shape: {
          fill: themeColors.colorTextShade1,
          strokeColor:
            (optionsProp?.colorMode ?? colorMode) === ColorMode.None
              ? themeColors.colorBackgroundShade1
              : colorBlack,
          strokeWidth: 3,
          ...optionsProp?.styles?.shape,
        },
        transformContinuous: {
          chevronSize: 12,
          fill: themeColors.colorTextShade1,
          lineDash: [20, 30],
          lineThickness: 4,
          pointRadius: 12,
          strokeColor: themeColors.colorBackgroundShade1,
          strokeWidth: 3,
          ...optionsProp?.styles?.transformContinuous,
        },
        transformEccentric: {
          chevronSize: 12,
          fill: themeColors.colorTextShade1,
          lineDash: [20, 30],
          lineThickness: 4,
          pointRadius: 12,
          strokeColor: themeColors.colorBackgroundShade1,
          strokeWidth: 3,
          ...optionsProp?.styles?.transformEccentric,
        },
        vertexType: {
          pointRadius: 6,
          strokeColor: themeColors.colorBackgroundShade1,
          strokeWidth: 2,
          ...optionsProp?.styles?.vertexType,
        },
      },
    }),
    [
      autoRotate,
      expansionPhases,
      colorMode,
      optionsProp,
      maxStage,
      scaleMode,
      scaleSize,
      showAnnotations,
      showDebug,
      themeColors,
    ]
  );

  // Transfer the canvas to the worker
  useEffect(() => {
    if (refCanvas.current && !refCanvasTransferred.current) {
      const offscreenCanvas = refCanvas.current.transferControlToOffscreen();
      api.transferCanvas([refUuid.current, offscreenCanvas], [offscreenCanvas]);
      refCanvasTransferred.current = true;
    }
  }, [api]);

  // Render the tiling
  useEffect(() => {
    try {
      const scaledWidth = width * window.devicePixelRatio * scale;
      const scaledHeight = height * window.devicePixelRatio * scale;

      if (!scaledWidth || !scaledHeight) {
        return;
      }

      api
        .renderNotation([
          refUuid.current,
          notation,
          scaledWidth,
          scaledHeight,
          options,
          validations,
        ])
        .then(setTiling);
    } catch (error) {
      setError((error as Error).message);
    }
  }, [
    api,
    notation,
    scale,
    width,
    height,
    options,
    setError,
    setTiling,
    validations,
  ]);

  return (
    <Box {...rest} flex="vertical" grow>
      <Box basis="0" container grow ref={setSize}>
        <Motion
          animate={{ scale: showLoading ? 0.95 : 1 }}
          initial={{ scale: 1 }}
        >
          <Box
            absolute="edge-to-edge"
            ref={refCanvas}
            tag="canvas"
            style={{
              height: `${height * scale}px`,
              width: `${width * scale}px`,
              opacity: showLoading ? 0.5 : 1,
              transformOrigin: 'top left',
              transform: `scale(${1 / scale})`,
              filter: shadow
                ? `drop-shadow(5px 5px ${
                    Math.max(width, height) / 7
                  }px rgba(20, 0, 20, ${
                    theme === 'night' ? 0.8 : 0.2
                  })) drop-shadow(1px 3px ${2}px rgba(20, 0, 20, ${
                    theme === 'night' ? 0.8 : 0.4
                  }))`
                : undefined,
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
