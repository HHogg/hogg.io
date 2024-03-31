import { SvgLabel } from '@hogg/common';
import { Box, colorNegativeShade5, useThemeContext } from 'preshape';
import { useEffect } from 'react';
import Circle from '../Shapes/Circle';
import Line from '../Shapes/Line';
import { useLineSegmentContext } from '../useLineSegmentContext';
import laserSound from './laser.wav';

const laserAudio = new Audio();
laserAudio.src = laserSound;

export default function ExtendedLineSegment() {
  const { colors } = useThemeContext();
  const {
    extendedLineSegmentToBounds,
    extendedLineSegmentToContainer,
    extendStart,
    extendEnd,
  } = useLineSegmentContext();

  useEffect(() => {
    laserAudio.play();
  }, [extendStart, extendEnd]);

  if (!extendStart && !extendEnd) {
    return null;
  }

  return (
    <Box textColor="negative-shade-4" tag="g">
      <Line
        id="extended-line-segment-to-container"
        x1={extendedLineSegmentToContainer.p1.x}
        x2={extendedLineSegmentToContainer.p2.x}
        y1={extendedLineSegmentToContainer.p1.y}
        y2={extendedLineSegmentToContainer.p2.y}
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.5}
      />

      <Line
        id="extended-line-segment-to-bounds"
        x1={extendedLineSegmentToBounds.p1.x}
        x2={extendedLineSegmentToBounds.p2.x}
        y1={extendedLineSegmentToBounds.p1.y}
        y2={extendedLineSegmentToBounds.p2.y}
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
          x={extendedLineSegmentToBounds.p1.x}
          y={extendedLineSegmentToBounds.p1.y}
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
          x={extendedLineSegmentToBounds.p2.x}
          y={extendedLineSegmentToBounds.p2.y}
          style={{ filter: `drop-shadow(0 0 16px ${colorNegativeShade5})` }}
        />
      )}

      {extendStart && (
        <SvgLabel
          id="extended-line-segment-start-label"
          isVisible
          targetX={extendedLineSegmentToBounds.p1.x}
          targetY={extendedLineSegmentToBounds.p1.y}
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
          targetX={extendedLineSegmentToBounds.p2.x}
          targetY={extendedLineSegmentToBounds.p2.y}
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
