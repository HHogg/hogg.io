import {
  Box,
  BoxProps,
  Text,
  useResizeObserver,
  useThemeContext,
} from 'preshape';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { v4 } from 'uuid';

export type RendererProps = {
  scale?: number;
  shadow?: boolean;
  render: (id: string) => void;
};

function Canvas({
  scale = 1,
  shadow,
  render,
  ...rest
}: BoxProps & RendererProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');
  const { theme } = useThemeContext();
  const [size, setSize] = useResizeObserver<HTMLDivElement>();
  const { height, width } = size;
  const id = useMemo(() => v4(), []);

  useEffect(() => {
    if (ref.current) {
      ref.current.width = width * window.devicePixelRatio * scale;
      ref.current.height = height * window.devicePixelRatio * scale;
      ref.current.style.width = `${width * scale}px`;
      ref.current.style.height = `${height * scale}px`;
      ref.current.style.transform = `scale(${1 / scale})`;

      try {
        render(id);
        setError('');
      } catch (error) {
        setError((error as Error).message);
      }
    }
  }, [scale, height, width, render, id]);

  return (
    <Box {...rest} flex="vertical" grow>
      <Box basis="0" container grow ref={setSize}>
        <Box
          absolute="edge-to-edge"
          id={id}
          ref={ref}
          tag="canvas"
          style={{
            transformOrigin: 'top left',
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

const CanvasMemo = memo(Canvas);

export default CanvasMemo;
