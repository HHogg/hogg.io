import { motion } from 'framer-motion';
import { Text, TextProps, sizeX2Px, useResizeObserver } from 'preshape';
import { useMemo, useRef } from 'react';
import { Label, Rect } from './types';
import { useLabelShift } from './useLabelShift';

type SvgLabelProps = Omit<
  TextProps,
  'paddingHorizontal' | 'paddingVertical'
> & {
  isVisible?: boolean;
  x: number;
  y: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  text: string;
};

export default function SvgLabel({
  x: xProps,
  y: yProps,
  isVisible,
  backgroundColor,
  borderRadius,
  paddingHorizontal = 0,
  paddingVertical = 0,
  text,
  ...rest
}: SvgLabelProps) {
  const ref = useRef<SVGRectElement>(null);
  const [size, setSize] = useResizeObserver();

  const height = size?.height + paddingVertical * 2;
  const width = size?.width + paddingHorizontal * 2;
  const x = xProps - width / 2;
  const y = yProps - height / 2;

  const cx = width / 2;
  const cy = height / 2;

  const rect = useMemo<Rect>(
    () => ({
      height,
      width,
      x,
      y,
    }),
    [height, width, x, y]
  );

  const label = useMemo<Label>(
    () => ({
      id: text,
      geometry: rect,
      padding: sizeX2Px,
    }),
    [rect, text]
  );

  const [shiftX, shiftY] = useLabelShift(label);

  return (
    <motion.g
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ ease: 'easeOut' }}
      transform={`translate(${x + shiftX},${y + shiftY})`}
    >
      <line
        stroke="currentColor"
        strokeDasharray="4 4"
        strokeWidth="1"
        x1={cx}
        y1={cy}
        x2={-shiftX + cx}
        y2={-shiftY + cy}
      />

      <rect
        ref={ref}
        x={0}
        y={0}
        width={width}
        height={height}
        fill={`var(--color-${backgroundColor}`}
        rx={borderRadius}
        ry={borderRadius}
      />

      <Text
        {...rest}
        tag="text"
        alignmentBaseline="middle"
        fill="currentColor"
        style={{ lineHeight: 1 }}
        ref={setSize}
        textAnchor="middle"
        transform={`translate(${cx},${cy})`}
      >
        {text}
      </Text>
    </motion.g>
  );
}
