import { curveMonotoneX } from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { useMemo } from 'react';
import { useSeriesChartContext } from './useSeriesChartContext';

type Props = {
  color: string;
  series: number[];
};

export default function SeriesChartLine({ color, series, ...rest }: Props) {
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

  return (
    <g>
      <LinePath
        {...rest}
        curve={curveMonotoneX}
        data={series.map((d, i) => ({ x: i, y: d }))}
        opacity={0.2}
        stroke={color}
        strokeWidth={5}
        x={(d) => xScale(d.x) ?? 0}
        y={(d) => yScale(d.y) ?? 0}
      />

      <LinePath
        {...rest}
        curve={curveMonotoneX}
        data={series.map((d, i) => ({ x: i, y: d }))}
        stroke={color}
        strokeWidth={1}
        x={(d) => xScale(d.x) ?? 0}
        y={(d) => yScale(d.y) ?? 0}
      />
    </g>
  );
}
