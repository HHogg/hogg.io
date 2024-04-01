import { Box } from 'preshape';
import Circle from '../Shapes/Circle';
import Line from '../Shapes/Line';
import Text from '../Shapes/Text';
import { useLineSegmentContext } from '../useLineSegmentContext';

export default function Atan2Annotations() {
  const { x1, y1, x2, y2 } = useLineSegmentContext();
  const diameter = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const radius = diameter * 0.5;
  const cx = x1 + (x2 - x1) / 2;
  const cy = y1 + (y2 - y1) / 2;

  return (
    <Box tag="g" textColor="text-shade-3">
      <Circle
        id="atan2-circle"
        r={diameter * 0.5}
        x={cx}
        y={cy}
        strokeDasharray="4 4"
        type="outline"
      />

      <Line
        id="atan2-line-vertical"
        x1={cx}
        x2={cx}
        y1={cy - radius}
        y2={cy + radius}
        strokeWidth={1}
        strokeDasharray="4 4"
      />

      <Line
        id="atan2-line-horizontal"
        x1={cx - radius}
        x2={cx + radius}
        y1={cy}
        y2={cy}
        strokeWidth={1}
        strokeDasharray="4 4"
      />

      <Text
        id="atan-2-top-label"
        x={cx}
        y={cy - radius}
        text="-∏/2"
        translateY={-0.5}
        paddingVertical={4}
        size="x3"
        weight="x2"
        opacity={0.5}
      />

      <Text
        id="atan-2-right-label"
        x={cx + radius}
        y={cy}
        text="0"
        translateX={0.5}
        paddingHorizontal={4}
        size="x3"
        weight="x2"
        opacity={0.5}
      />

      <Text
        id="atan-2-bottom-label"
        x={cx}
        y={cy + radius}
        text="∏/2"
        translateY={0.5}
        paddingVertical={4}
        size="x3"
        weight="x2"
        opacity={0.5}
      />

      <Text
        id="atan-2-left-label"
        x={cx - radius}
        y={cy}
        text="±∏"
        translateX={-0.5}
        paddingHorizontal={4}
        size="x3"
        weight="x2"
        opacity={0.5}
      />
    </Box>
  );
}
