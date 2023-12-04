import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { XYChart } from '@visx/xychart';

import {
  Box,
  List,
  ListItem,
  Text,
  useResizeObserver,
  useThemeContext,
} from 'preshape';

import { colors } from './constants';

const getPoints = (count: number, equation: (x: number) => number) => {
  const pointsOnLeft: [number, number][] = Array.from({
    length: count,
  }).map((_, i) => {
    const xValue = -count + i;
    const yValue = equation(xValue);

    return [xValue, yValue];
  });

  const pointsOnRight: [number, number][] = Array.from({
    length: count,
  }).map((_, i) => {
    const xValue = i + 1;
    const yValue = equation(xValue);

    return [xValue, yValue];
  });

  return [...pointsOnLeft, [0, equation(0)], ...pointsOnRight].filter(
    ([, y]) => !isNaN(y)
  );
};

export type YPlotProps = {
  count?: number;
  dashed?: boolean;
  dashedGap?: number;
  dashedLength?: number;
  equations: [string, (a: number) => number][];
};

const YPlot = ({
  equations,
  count = 100,
  dashed,
  dashedGap = 0,
  dashedLength = 20,
}: YPlotProps) => {
  const { colors: themeColors } = useThemeContext();
  const [size, ref] = useResizeObserver<HTMLDivElement>();

  const series = equations?.map(([, equation]) => getPoints(count, equation));

  const xScale = scaleLinear({
    domain: [-count, count],
    range: [0, size.width],
  });

  const yScales = series.map((points) => {
    const maxY = Math.max(...points.map(([, y]) => Math.abs(y)));

    return scaleLinear({
      domain: [-maxY, maxY],
      range: [size.height, 0],
    });
  });

  return (
    <Box flex="vertical" gap="x3" padding="x6">
      <Box container height={150} ref={ref}>
        {!!size.width && !!size.height && (
          <Box absolute="edge-to-edge">
            <XYChart
              height={size.height}
              width={size.width}
              xScale={{ type: 'linear' }}
              yScale={{ type: 'linear' }}
            >
              <AxisBottom
                top={yScales[0](0)}
                scale={xScale}
                stroke={themeColors.colorTextShade1}
                strokeWidth={1}
                tickStroke={themeColors.colorTextShade1}
                tickFormat={() => ''}
                tickLabelProps={{
                  fill: 'currentColor',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                }}
              />

              <AxisLeft
                left={xScale(0)}
                scale={yScales[0]}
                stroke={themeColors.colorTextShade1}
                strokeWidth={1}
                tickStroke={themeColors.colorTextShade1}
                tickFormat={() => ''}
                tickLabelProps={{
                  fill: 'currentColor',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                }}
              />

              {series.map((points, index) => (
                <LinePath
                  key={index}
                  data={points}
                  stroke={colors[index]}
                  strokeDasharray={
                    dashed
                      ? `${dashedLength} ${
                          (dashedLength + dashedGap) * (series.length - 1) +
                          dashedGap
                        }`
                      : ''
                  }
                  strokeDashoffset={(dashedLength + dashedGap) * index}
                  strokeWidth={1}
                  x={(d) => xScale(d[0])}
                  y={(d) => yScales[index](d[1])}
                />
              ))}
            </XYChart>
          </Box>
        )}
      </Box>

      <Box flex="horizontal">
        <List alignChildren="middle" basis="0" gap="x1" grow>
          {equations.map(([name], index) => (
            <ListItem key={name} padding="x1" separator="">
              <Box alignChildren="middle" flex="horizontal" gap="x2">
                <Box>
                  <Box
                    borderRadius="full"
                    height="12px"
                    style={{ backgroundColor: colors[index] }}
                    width="12px"
                  />
                </Box>

                <Box>
                  <Text size="x3" weight="x2">
                    {name}
                  </Text>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default YPlot;
