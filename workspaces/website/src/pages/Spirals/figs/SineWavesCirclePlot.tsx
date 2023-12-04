import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import { Circle, LinePath } from '@visx/shape';
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
import { useEffect, useMemo, useState } from 'react';
import { colors } from './constants';

const format = (v: number) => {
  return numbro(v).format({
    forceSign: true,
    totalLength: 3,
  });
};

const SineWavesCirclePlot = () => {
  const { colors: themeColors } = useThemeContext();
  const [{ width, height }, ref] = useResizeObserver<HTMLDivElement>();
  const [sizeLeftAxis, refLeftAxis] = useResizeObserver<SVGGElement>();
  const [sizeBottomAxis, refBottomAxis] = useResizeObserver<SVGGElement>();
  const [angle, setAngle] = useState(0);

  const size = Math.min(width, height);

  const leftPadding = sizeLeftAxis?.width || 0;
  const bottomPadding = sizeBottomAxis?.height || 0;
  const padding = Math.max(leftPadding, bottomPadding);

  const xScale = useMemo(
    () =>
      scaleLinear({
        domain: [-1, 1],
        range: [padding, size],
      }),
    [size, padding]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [-1, 1],
        range: [size - padding, 0],
      }),
    [size, padding]
  );

  const radians = angle % (Math.PI * 2);

  const names: string[] = [
    `sin θ: ${format(Math.sin(angle))}`,
    `cos θ: ${format(Math.cos(angle))}`,
    `θ: ${format(radians)}`,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((angle) => angle + 0.01);
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Box flex="vertical" gap="x3">
      <Box container height={300} width="100%" ref={ref}>
        {size && (
          <Box absolute="center">
            <XYChart
              height={size}
              width={size}
              xScale={{ type: 'linear' }}
              yScale={{ type: 'linear' }}
            >
              <AxisLeft
                innerRef={refLeftAxis}
                left={padding}
                scale={yScale}
                stroke={themeColors.colorTextShade1}
                strokeWidth={2}
                tickStroke={themeColors.colorTextShade1}
                tickFormat={(v) => format(v as number)}
                tickValues={[-1, 0, 1]}
                tickLabelProps={{
                  fill: 'currentColor',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                }}
              />

              <AxisBottom
                innerRef={refBottomAxis}
                top={size - padding}
                scale={xScale}
                stroke={themeColors.colorTextShade1}
                strokeWidth={2}
                tickStroke={themeColors.colorTextShade1}
                tickValues={[-1, 0, 1]}
                tickFormat={(v) => format(v as number)}
                tickLabelProps={{
                  fill: 'currentColor',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                }}
              />

              <LinePath
                data={[
                  { x: 0, y: -1 },
                  { x: 0, y: 1 },
                ]}
                stroke="currentColor"
                strokeDasharray="4, 4"
                strokeWidth={1}
                x={(d) => xScale(d.x)}
                y={(d) => yScale(d.y)}
              />

              <LinePath
                data={[
                  { x: -1, y: 0 },
                  { x: 1, y: 0 },
                ]}
                stroke="currentColor"
                strokeDasharray="4, 4"
                strokeWidth={1}
                x={(d) => xScale(d.x)}
                y={(d) => yScale(d.y)}
              />

              <Circle
                cx={xScale(0)}
                cy={yScale(0)}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={2}
                r={(size - padding) * 0.5}
              />

              <LinePath
                data={[
                  { y: Math.sin(angle), x: -1 },
                  { y: Math.sin(angle), x: 1 },
                ]}
                stroke={colors[0]}
                strokeWidth={2}
                x={(d) => xScale(d.x)}
                y={(d) => yScale(d.y)}
              />

              <LinePath
                data={[
                  { x: Math.cos(angle), y: -1 },
                  { x: Math.cos(angle), y: 1 },
                ]}
                stroke={colors[1]}
                strokeWidth={2}
                x={(d) => xScale(d.x)}
                y={(d) => yScale(d.y)}
              />

              <Circle
                cx={xScale(Math.cos(angle))}
                cy={yScale(Math.sin(angle))}
                fill={colors[2]}
                r={4}
              />

              <Circle
                cx={xScale(Math.cos(angle))}
                cy={yScale(Math.sin(angle))}
                fill="transparent"
                stroke={colors[2]}
                strokeWidth={1}
                r={16}
              />
            </XYChart>
          </Box>
        )}
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

export default SineWavesCirclePlot;
