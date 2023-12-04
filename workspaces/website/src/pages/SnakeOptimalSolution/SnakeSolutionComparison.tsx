import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { XYChart } from '@visx/xychart';
import numbro from 'numbro';
import {
  Box,
  List,
  ListItem,
  Text,
  useResizeObserver,
  useThemeContext,
} from 'preshape';
import { useMemo } from 'react';

const format = (v: number) =>
  numbro(v).format({
    average: true,
    totalLength: 1,
    trimMantissa: true,
  });

const names: string[] = [
  'Tail Escape',
  'Hamiltonian Cycle',
  'Euclidean Distance',
  'Manhattan Distance',
];

const colors: string[] = ['#06FC9E', '#B768FC', '#0DFDF9', '#F569C4'];

interface Props {
  series: { x: number; y: number }[][];
  seriesPoints: { x: number; y: number }[];
  title: string;
  xDomain: [number, number];
  yDomain: [number, number];
}

const SnakeSolutionComparison = ({
  series,
  seriesPoints,
  title,
  xDomain,
  yDomain,
}: Props) => {
  const { colors: themeColors } = useThemeContext();
  const [size, ref] = useResizeObserver<HTMLDivElement>();
  const [sizeLeftAxis, refLeftAxis] = useResizeObserver<SVGGElement>();
  const [sizeBottomAxis, refBottomAxis] = useResizeObserver<SVGGElement>();

  const xScale = useMemo(
    () =>
      scaleLinear({ domain: xDomain, range: [sizeLeftAxis.width, size.width] }),
    [size.width, sizeLeftAxis.width, xDomain]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: yDomain,
        range: [size.height - sizeBottomAxis.height, 0],
      }),
    [size.height, sizeBottomAxis.height, yDomain]
  );

  return (
    <Box basis="0" flex="vertical" gap="x3" grow>
      <Box>
        <Text align="middle" margin="x2" size="x3" weight="x2">
          {title}
        </Text>

        <Box container height={200} ref={ref}>
          {!!size.width && !!size.height && (
            <Box absolute="edge-to-edge">
              <XYChart
                height={size.height}
                width={size.width}
                xScale={{ type: 'linear' }}
                yScale={{ type: 'linear' }}
              >
                <AxisLeft
                  innerRef={refLeftAxis}
                  left={sizeLeftAxis.width}
                  scale={yScale}
                  stroke={themeColors.colorTextShade1}
                  strokeWidth={2}
                  tickStroke={themeColors.colorTextShade1}
                  tickFormat={(v) => format(v as number)}
                  tickLabelProps={{
                    fill: 'currentColor',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                  }}
                />

                <AxisBottom
                  innerRef={refBottomAxis}
                  top={size.height - sizeBottomAxis.height}
                  scale={xScale}
                  stroke={themeColors.colorTextShade1}
                  strokeWidth={2}
                  tickStroke={themeColors.colorTextShade1}
                  tickLabelProps={{
                    fill: 'currentColor',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                  }}
                />

                <g opacity={0.35}>
                  {series.map((data, index) => (
                    <LinePath
                      key={`line-bg-${index}`}
                      curve={curveMonotoneX}
                      data={data}
                      stroke={colors[index]}
                      strokeWidth={8}
                      x={(d) => xScale(d.x) ?? 0}
                      y={(d) => yScale(d.y) ?? 0}
                    />
                  ))}

                  {seriesPoints.map((data, index) => (
                    <circle
                      cx={xScale(data.x)}
                      cy={yScale(data.y)}
                      fill={colors[index]}
                      key={index}
                      r={12}
                    />
                  ))}
                </g>

                {series.map((data, index) => (
                  <LinePath
                    key={`line-fg-${index}`}
                    curve={curveMonotoneX}
                    data={data}
                    stroke={colors[index]}
                    strokeWidth={2}
                    x={(d) => xScale(d.x) ?? 0}
                    y={(d) => yScale(d.y) ?? 0}
                  />
                ))}

                {seriesPoints.map((data, index) => (
                  <circle
                    cx={xScale(data.x)}
                    cy={yScale(data.y)}
                    fill={colors[index]}
                    key={index}
                    r={4}
                  />
                ))}
              </XYChart>
            </Box>
          )}
        </Box>
      </Box>

      <Box flex="horizontal">
        <List alignChildren="middle" basis="0" gap="x1" grow>
          {names.map((name, index) => (
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

export default SnakeSolutionComparison;
