import {
  Box,
  BoxProps,
  Text,
  colorBlack,
  colorNegativeShade4,
  useResizeObserver,
  useThemeContext,
} from 'preshape';
import { memo, useEffect, useMemo, useState } from 'react';
import { v4 } from 'uuid';
import { useArrangementContext } from '../Arrangement/useArrangementContext';
import { useNotationContext } from '../Notation/useNotationContext';
import { usePlayerContext } from '../Player/usePlayerContext';
import { ColorMode, Options } from '../types';
import { renderNotation } from '../utils/wasm';

export type RendererProps = {
  options?: Partial<Options>;
  scale?: number;
  shadow?: boolean;
};

function RendererContent({
  options: optionsProp,
  scale = 1,
  shadow,
  ...rest
}: BoxProps & RendererProps) {
  const [canvasElement, refCanvasElement] = useState<Element | null>(null);
  const [error, setError] = useState('');
  const { colors: themeColors, theme } = useThemeContext();
  const { notation } = useNotationContext();
  const { setTiling } = useArrangementContext();
  const {
    autoRotate,
    expansionPhases,
    colorMode,
    maxStage,
    scaleMode,
    scaleSize,
    showAnnotations,
    showDebug,
  } = usePlayerContext();
  const [size, ref] = useResizeObserver<HTMLDivElement>();
  const canvasId = useMemo(() => v4(), []);

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
            colorMode === ColorMode.None
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

  useEffect(() => {
    if (canvasElement) {
      const { width, height } = size;

      (canvasElement as HTMLCanvasElement).width =
        width * window.devicePixelRatio * scale;
      (canvasElement as HTMLCanvasElement).height =
        height * window.devicePixelRatio * scale;
      (canvasElement as HTMLCanvasElement).style.width = `${width * scale}px`;
      (canvasElement as HTMLCanvasElement).style.height = `${height * scale}px`;
      (canvasElement as HTMLCanvasElement).style.transform = `scale(${
        1 / scale
      })`;
      try {
        const tiling = renderNotation(notation, canvasId, options);

        setTiling(tiling);
        setError('');
      } catch (error) {
        console.error(error);
        setError((error as Error).message);
      }
    }
  }, [setTiling, canvasElement, canvasId, notation, options, scale, size]);

  return (
    <Box {...rest} flex="vertical" grow>
      <Box basis="0" container grow ref={ref}>
        <Box
          absolute="edge-to-edge"
          id={canvasId}
          ref={refCanvasElement}
          tag="canvas"
          style={{
            transformOrigin: 'top left',
            filter: shadow
              ? `drop-shadow(5px 5px ${
                  Math.max(size.width, size.height) / 7
                }px rgba(20, 0, 20, ${
                  theme === 'night' ? 0.8 : 0.2
                })) drop-shadow(1px 3px ${2}px rgba(20, 0, 20, ${
                  theme === 'night' ? 0.8 : 0.4
                }))`
              : undefined,
          }}
        ></Box>

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

const RendererContentMemo = memo(RendererContent);

export default RendererContentMemo;
