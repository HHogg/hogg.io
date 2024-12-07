import { curveMonotoneX } from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { LinePath, AreaClosed } from '@visx/shape';
import { useMemo } from 'react';
import { useSeriesChartContext } from './useSeriesChartContext';

type Props = {
  color: string;
  id: string;
  series: number[];
  withGradientArea?: boolean;
};

export default function SeriesChartLine({
  color,
  id,
  series,
  withGradientArea,
  ...rest
}: Props) {
  const { width, height } = useSeriesChartContext();

  const xScale = useMemo(
    () => scaleLinear({ domain: [0, series.length - 1], range: [0, width] }),
    [series, width]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, Math.max(...series)],
        range: [height, 0],
      }),
    [series, height]
  );

  if (series.length === 0 || !width || !height) {
    return null;
  }

  const data = series.map((d, i) => ({ x: i, y: d }));
  const x = (d: (typeof data)[number]) => xScale(d.x) ?? 0;
  const y = (d: (typeof data)[number]) => yScale(d.y) ?? 0;

  return (
    <g>
      {withGradientArea && (
        <>
          <defs>
            <mask id={`fade-out-${id}`}>
              <linearGradient id="horizontal-fade" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>

              <rect width="100%" height="100%" fill="url(#horizontal-fade)" />
            </mask>

            <linearGradient id={`gradient-${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.75} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <AreaClosed
            data={data}
            fill={`url(#gradient-${id})`}
            mask={`url(#fade-out-${id})`}
            x={x}
            y={y}
            yScale={yScale}
          />
        </>
      )}

      <LinePath
        {...rest}
        curve={curveMonotoneX}
        data={data}
        opacity={0.2}
        stroke={color}
        strokeWidth={5}
        x={x}
        y={y}
      />

      <LinePath
        {...rest}
        curve={curveMonotoneX}
        data={data}
        stroke={color}
        strokeWidth={1}
        x={x}
        y={y}
      />
    </g>
  );
}
