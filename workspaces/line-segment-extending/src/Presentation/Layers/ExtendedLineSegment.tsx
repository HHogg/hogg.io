import { SvgLabel } from '@hogg/common';
import { Box, colorNegativeShade5, useThemeContext } from 'preshape';
import { useEffect, useRef } from 'react';
import Circle from '../Shapes/Circle';
import Line from '../Shapes/Line';
import { useLineSegmentContext } from '../useLineSegmentContext';

export default function ExtendedLineSegment() {
  const { colors } = useThemeContext();
  const {
    extendedLineSegmentToBounds,
    extendedLineSegmentToContainer,
    extendStart,
    extendEnd,
  } = useLineSegmentContext();
  const previousExtendStart = useRef(extendStart);
  const previousExtendEnd = useRef(extendEnd);

  useEffect(() => {
    previousExtendStart.current = extendStart;
    previousExtendEnd.current = extendEnd;
  }, [extendStart, extendEnd]);

  if (!extendStart && !extendEnd) {
    return null;
  }

  return (
    <Box textColor="negative-shade-4" tag="g">
      <Line
        id="extended-line-segment-to-container"
        x1={extendedLineSegmentToContainer[0]}
        y1={extendedLineSegmentToContainer[1]}
        x2={extendedLineSegmentToContainer[2]}
        y2={extendedLineSegmentToContainer[3]}
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.5}
      />

      <Line
        id="extended-line-segment-to-bounds"
        x1={extendedLineSegmentToBounds[0]}
        y1={extendedLineSegmentToBounds[1]}
        x2={extendedLineSegmentToBounds[2]}
        y2={extendedLineSegmentToBounds[3]}
        strokeWidth={1}
        style={{ filter: `drop-shadow(0 0 5px ${colorNegativeShade5})` }}
      />

      {extendStart && (
        <Circle
          id="extended-line-segment-start"
          type="solid"
          fill="currentColor"
          stroke={colors.colorBackgroundShade2}
          strokeWidth={2}
          r={6}
          x={extendedLineSegmentToBounds[0]}
          y={extendedLineSegmentToBounds[1]}
          style={{ filter: `drop-shadow(0 0 16px ${colorNegativeShade5})` }}
        />
      )}

      {extendEnd && (
        <Circle
          id="extended-line-segment-end"
          type="solid"
          fill="currentColor"
          stroke={colors.colorBackgroundShade2}
          strokeWidth={2}
          r={6}
          x={extendedLineSegmentToBounds[2]}
          y={extendedLineSegmentToBounds[3]}
          style={{ filter: `drop-shadow(0 0 16px ${colorNegativeShade5})` }}
        />
      )}

      {extendStart && (
        <SvgLabel
          id="extended-line-segment-start-label"
          isVisible
          targetX={extendedLineSegmentToBounds[0]}
          targetY={extendedLineSegmentToBounds[1]}
          text="(ix1,iy1)"
          paddingHorizontal={2}
          paddingVertical={2}
          monospace
          size="x3"
          backgroundColor="background-shade-2"
          textColor="negative-shade-4"
          lineColor="negative-shade-4"
          weight="x2"
        />
      )}

      {extendEnd && (
        <SvgLabel
          id="extended-line-segment-end-label"
          isVisible
          targetX={extendedLineSegmentToBounds[2]}
          targetY={extendedLineSegmentToBounds[3]}
          text="(ix2,iy2)"
          paddingHorizontal={2}
          paddingVertical={2}
          monospace
          size="x3"
          backgroundColor="background-shade-2"
          textColor="negative-shade-4"
          lineColor="negative-shade-4"
          weight="x2"
        />
      )}
    </Box>
  );
}
