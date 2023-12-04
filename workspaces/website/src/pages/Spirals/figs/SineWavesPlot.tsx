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
    totalLength: 3,
  });
};

const points = Array.from({ length: 1000 }).map(
  (_, i, { length }) => (i / length) * Math.PI * 2
);

const SineWaves = () => {
  const { colors: themeColors } = useThemeContext();
  const [size, ref] = useResizeObserver<HTMLDivElement>();
  const [sizeLeftAxis, refLeftAxis] = useResizeObserver<SVGGElement>();
  const [sizeBottomAxis, refBottomAxis] = useResizeObserver<SVGGElement>();
  const [angle, setAngle] = useState(0);

  const xScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, Math.PI * 2],
        range: [sizeLeftAxis.width, size.width],
      }),
    [size.width, sizeLeftAxis.width]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [-1, 1],
        range: [size.height - sizeBottomAxis.height, 0],
      }),
    [size.height, sizeBottomAxis.height]
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
    <Box basis="0" flex="vertical" gap="x3" grow>
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
                top={size.height * 0.5 - sizeBottomAxis.height * 0.5}
                scale={xScale}
                stroke={themeColors.colorTextShade1}
                strokeWidth={2}
                tickStroke={themeColors.colorTextShade1}
                tickValues={[
                  Math.PI / 2,
                  Math.PI,
                  (Math.PI * 3) / 2,
                  Math.PI * 2,
                ]}
                tickFormat={(_, i) => ['π/2', 'π', '3π/2', '2π'][i as number]}
                tickLabelProps={{
                  fill: 'currentColor',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                }}
              />

              <LinePath
                data={points.map((r) => ({ x: r, y: Math.sin(r) }))}
                stroke={colors[0]}
                strokeWidth={2}
                x={(d) => xScale(d.x)}
                y={(d) => yScale(d.y)}
              />

              <LinePath
                data={points.map((r) => ({ x: r, y: Math.cos(r) }))}
                stroke={colors[1]}
                strokeWidth={2}
                x={(d) => xScale(d.x)}
                y={(d) => yScale(d.y)}
              />

              <LinePath
                data={[
                  { x: radians, y: Math.sin(angle) },
                  { x: radians, y: Math.cos(angle) },
                ]}
                stroke={colors[2]}
                strokeWidth={1}
                x={(d) => xScale(d.x)}
                y={(d) => yScale(d.y)}
              />

              <Circle
                cx={xScale(radians)}
                cy={yScale(Math.cos(angle))}
                fill={colors[2]}
                r={4}
              />

              <Circle
                cx={xScale(radians)}
                cy={yScale(Math.cos(angle))}
                fill="transparent"
                stroke={colors[2]}
                strokeWidth={1}
                r={16}
              />

              <Circle
                cx={xScale(radians)}
                cy={yScale(Math.sin(angle))}
                fill={colors[2]}
                r={4}
              />

              <Circle
                cx={xScale(radians)}
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

export default SineWaves;
