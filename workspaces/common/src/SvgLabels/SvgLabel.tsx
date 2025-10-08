import { motion, SpringOptions, useSpring } from 'framer-motion';
import {
  Box,
  Text,
  TextProps,
  TypeColor,
  sizeX3Px,
  useResizeObserver,
} from 'preshape';
import { useEffect, useMemo, useRef } from 'react';
import { Label } from './types';
import { useLabelShift } from './useLabelShift';

const springOptions: SpringOptions = {
  damping: 50,
  stiffness: 400,
  mass: 0.5,
};

type SvgLabelProps = Omit<
  TextProps,
  'paddingHorizontal' | 'paddingVertical' | 'margin'
> & {
  id: string;
  isVisible?: boolean;
  paddingHorizontal?: number;
  paddingVertical?: number;
  margin?: number;
  text: JSX.Element | string;
  offsetX?: number;
  offsetY?: number;
  targetX: number;
  targetY: number;
  onDimensionsChange?: (size: { height: number; width: number }) => void;
  lineColor?: TypeColor;
};

export default function SvgLabel({
  id,
  isVisible,
  backgroundColor,
  borderRadius,
  margin = sizeX3Px,
  paddingHorizontal = 0,
  paddingVertical = 0,
  stroke,
  offsetX = 0,
  offsetY = 0,
  targetX,
  targetY,
  text,
  onDimensionsChange,
  lineColor = 'text-shade-1',
  ...rest
}: SvgLabelProps) {
  const ref = useRef<SVGRectElement>(null);
  const [size, setSize] = useResizeObserver();

  const height = size?.height + paddingVertical * 2;
  const width = size?.width + paddingHorizontal * 2;

  const dx = width * 0.5;
  const dy = height * 0.5;

  const label = useMemo<Label>(
    () => ({
      id,
      width,
      height,
      padding: margin,
      offsetX,
      offsetY,
      targetX,
      targetY,
    }),
    [id, margin, offsetX, offsetY, targetX, targetY, width, height]
  );

  const { labelObstacle, labelLineObstacle } = useLabelShift(label, {
    isVisible,
  });

  const shiftedXSpring = useSpring(labelObstacle.geometry.x, springOptions);
  const shiftedYSpring = useSpring(labelObstacle.geometry.y, springOptions);

  const lineXSpring = useSpring(labelLineObstacle.geometry.x1, springOptions);
  const lineYSpring = useSpring(labelLineObstacle.geometry.y1, springOptions);

  useEffect(() => {
    shiftedXSpring.set(labelObstacle.geometry.x);
    shiftedYSpring.set(labelObstacle.geometry.y);
    lineXSpring.set(labelLineObstacle.geometry.x1);
    lineYSpring.set(labelLineObstacle.geometry.y1);
  }, [
    shiftedXSpring,
    labelObstacle,
    shiftedYSpring,
    lineXSpring,
    labelLineObstacle.geometry.x1,
    labelLineObstacle.geometry.y1,
    lineYSpring,
    dx,
    dy,
  ]);

  useEffect(() => {
    onDimensionsChange?.({ width, height });
  }, [height, onDimensionsChange, width]);

  return (
    <motion.g animate={{ opacity: isVisible ? 1 : 0 }} initial={{ opacity: 0 }}>
      <Box tag="g" textColor={lineColor}>
        <motion.line
          stroke="currentColor"
          strokeDasharray="4 4"
          strokeWidth="1"
          x1={lineXSpring}
          y1={lineYSpring}
          x2={label.targetX}
          y2={label.targetY}
        />
      </Box>

      <g>
        <motion.g
          animate={{ opacity: isVisible ? 1 : 0 }}
          initial={{ opacity: 0 }}
          style={{ x: shiftedXSpring, y: shiftedYSpring }}
        >
          <rect
            ref={ref}
            x={0}
            y={-1}
            width={width}
            height={height}
            fill={backgroundColor ? `var(--color-${backgroundColor}` : 'none'}
            stroke={stroke}
            strokeDasharray="4 4"
            strokeWidth="1"
            rx={borderRadius}
            ry={borderRadius}
          />

          <g transform={`translate(${width * 0.5} ${height * 0.5})`}>
            <Text
              {...rest}
              alignmentBaseline="middle"
              textAnchor="middle"
              tag="text"
              fill="currentColor"
              style={{ userSelect: 'none' }}
              ref={setSize}
            >
              {text}
            </Text>
          </g>
        </motion.g>
      </g>
    </motion.g>
  );
}
