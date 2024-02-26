import {
  colorNegativeShade4,
  themes,
  useResizeObserver,
  Box,
  BoxProps,
  useThemeContext,
} from 'preshape';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useSnakeContext } from './useSnakeContext';
import getGradientColor from './utils/getGradientColor';

const padding = 0;

type Props = BoxProps;

const SnakeRenderer = (props: Props) => {
  const { point, snake, values, xLength, yLength } = useSnakeContext();
  const { theme } = useThemeContext();

  const [{ height, width }, refContainer] = useResizeObserver();
  const refCanvas = useRef<HTMLCanvasElement>(null);

  const size = Math.min(width, height);

  const cellStep = Math.floor(
    Math.min((size - padding * 2) / yLength, (size - padding * 2) / xLength)
  );
  const cellPadding = cellStep * 0.1;
  const cellSize = cellStep - cellPadding;
  const offsetX = padding + (size - cellStep * xLength) / 2;
  const offsetY = padding + (size - cellStep * yLength) / 2;

  const redraw = useCallback(() => {
    if (refCanvas.current) {
      const ctx = refCanvas.current.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, size, size);

        for (let y = 0; y < yLength; y++) {
          for (let x = 0; x < xLength; x++) {
            const value = values && values[y] && values[y][x];
            const color =
              value !== null && isNaN(value)
                ? colorNegativeShade4
                : themes[theme].colorTextShade1;

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
          ctx.fillStyle = '#F52E97';
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

            if (value !== null) {
              ctx.fillStyle =
                point && x === point[0] && y === point[1]
                  ? themes[theme].colorTextShade1
                  : themes[theme].colorBackgroundShade1;

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

        for (let i = 0; i < snake.length; i++) {
          ctx.fillStyle = getGradientColor(
            theme,
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
  }, [
    cellSize,
    cellStep,
    offsetX,
    offsetY,
    point,
    size,
    snake,
    theme,
    values,
    xLength,
    yLength,
  ]);

  useEffect(redraw, [redraw]);

  useLayoutEffect(() => {
    if (refCanvas.current) {
      refCanvas.current.width = size * window.devicePixelRatio;
      refCanvas.current.height = size * window.devicePixelRatio;
      refCanvas.current.style.width = `${size}px`;
      refCanvas.current.style.height = `${size}px`;
      refCanvas.current
        .getContext('2d')
        ?.scale(window.devicePixelRatio, window.devicePixelRatio);
      redraw();
    }
  }, [size, redraw]);

  return (
    <Box {...props} container ref={refContainer}>
      <Box absolute="center" ref={refCanvas} tag="canvas" />
    </Box>
  );
};

export default SnakeRenderer;
