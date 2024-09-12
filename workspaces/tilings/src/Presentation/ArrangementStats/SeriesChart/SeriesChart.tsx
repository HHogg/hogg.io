import { XYChart } from '@visx/xychart';
import { Box, BoxProps, useResizeObserver } from 'preshape';
import { createContext } from 'react';

export const SeriesChartContext = createContext<{
  width: number;
  height: number;
}>({
  width: 0,
  height: 0,
});

const margin = { top: 0, right: 0, bottom: 0, left: 0 };

export default function SeriesChart({ children, ...rest }: BoxProps) {
  const [size, ref] = useResizeObserver<HTMLDivElement>();

  return (
    <Box {...rest} grow container ref={ref}>
      {!!size.width && !!size.height && (
        <Box absolute="edge-to-edge">
          <SeriesChartContext.Provider value={size}>
            <XYChart
              margin={margin}
              height={size.height}
              width={size.width}
              xScale={{ type: 'linear' }}
              yScale={{ type: 'linear' }}
            >
              {children}
            </XYChart>
          </SeriesChartContext.Provider>
        </Box>
      )}
    </Box>
  );
}
