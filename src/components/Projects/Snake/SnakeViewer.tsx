import {
  colorNegativeShade4,
  colorPositiveShade4,
  colorWhite,
  themes,
  useResizeObserver,
  Box,
  BoxProps,
  TypeTheme,
  useThemeContext,
} from 'preshape';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useSnakeContext } from './useSnakeContext';
import getGradientColor from './utils/getGradientColor';

const padding = 0;

type Props = BoxProps & {
  theme?: TypeTheme;
};

const SnakeViewer = ({ theme: themeProps, ...rest }: Props) => {
  const { point, snake, values, xLength, yLength } = useSnakeContext();
  const { theme: themeContext } = useThemeContext();
  const theme = themeProps || themeContext;

  const [{ height, width }, refContainer] = useResizeObserver();
  const refCanvas = useRef<HTMLCanvasElement>(null);

  const cellStep = Math.floor(
    Math.min((height - padding * 2) / yLength, (width - padding * 2) / xLength)
  );
  const cellPadding = cellStep * 0.1;
  const cellSize = cellStep - cellPadding;
  const offsetX = padding + (width - cellStep * xLength) / 2;
  const offsetY = padding + (height - cellStep * yLength) / 2;

  const redraw = useCallback(() => {
    if (refCanvas.current) {
      const ctx = refCanvas.current.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = themes[theme].colorBackgroundShade2;
        ctx.fillRect(
          offsetX - padding,
          offsetY - padding,
          cellStep * xLength + padding,
          cellStep * yLength + padding
        );

        for (let y = 0; y < yLength; y++) {
          for (let x = 0; x < xLength; x++) {
            const value = values && values[y] && values[y][x];
            const color =
              value !== undefined && isNaN(value)
                ? colorNegativeShade4
                : themes[theme].colorBackgroundShade3;

            ctx.fillStyle = color;
            ctx.fillRect(
              offsetX + x * cellStep,
              offsetY + y * cellStep,
              cellSize,
              cellSize
            );
          }
        }

        if (point) {
          ctx.fillStyle = colorPositiveShade4;
          ctx.fillRect(
            offsetX + point[0] * cellStep,
            offsetY + point[1] * cellStep,
            cellSize,
            cellSize
          );
        }

        for (let y = 0; y < yLength; y++) {
          for (let x = 0; x < xLength; x++) {
            const value = values && values[y] && values[y][x];

            if (value !== undefined) {
              ctx.fillStyle =
                point && x === point[0] && y === point[1]
                  ? colorWhite
                  : themes[theme].colorTextShade1;

              ctx.textAlign = 'center';
              ctx.font = '"Courier New", Courier, monospace';
              ctx.fillText(
                isNaN(value) ? 'NaN' : (+value.toFixed(2)).toString(),
                Math.floor(offsetX + x * cellStep + cellSize / 2),
                Math.floor(offsetY + y * cellStep + cellSize / 2) + 5
              );
            }
          }
        }

        if (snake) {
          for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = getGradientColor(
              themeContext,
              (snake.length - 1 - i) / snake.length
            );
            ctx.fillRect(
              offsetX + snake[i][0] * cellStep,
              offsetY + snake[i][1] * cellStep,
              cellSize,
              cellSize
            );
          }
        }
      }
    }
  }, [
    cellSize,
    cellStep,
    height,
    offsetX,
    offsetY,
    point,
    snake,
    theme,
    themeContext,
    values,
    width,
    xLength,
    yLength,
  ]);

  useEffect(redraw, [redraw]);

  useLayoutEffect(() => {
    if (refCanvas.current) {
      refCanvas.current.width = width * window.devicePixelRatio;
      refCanvas.current.height = height * window.devicePixelRatio;
      refCanvas.current.style.width = `${width}px`;
      refCanvas.current.style.height = `${height}px`;
      refCanvas.current
        .getContext('2d')
        ?.scale(window.devicePixelRatio, window.devicePixelRatio);
      redraw();
    }
  }, [height, width, redraw]);

  return (
    <Box {...rest} container grow ref={refContainer}>
      <Box absolute="edge-to-edge" ref={refCanvas} tag="canvas" />
    </Box>
  );
};

export default SnakeViewer;
