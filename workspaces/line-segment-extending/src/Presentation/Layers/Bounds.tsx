import { SvgLabel, useSvgLabelsContext } from '@hogg/common';
import { colorNegativeShade3, colorNegativeShade5 } from 'preshape';
import { useEffect } from 'react';
import Line from '../Shapes/Line';
import Rect from '../Shapes/Rect';
import { BoundFlag, useLineSegmentContext } from '../useLineSegmentContext';

const POINT_SIZE = 4;

type BoundingLine = {
  id: BoundFlag;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export default function Bounds() {
  const { registerObstacle } = useSvgLabelsContext();
  const {
    containerHeight,
    containerWidth,
    bounds,
    boundsWidth,
    boundsHeight,
    showBounds,
    extendedLineSegmentToBounds,
  } = useLineSegmentContext();

  const containerLines: BoundingLine[] = [
    {
      id: BoundFlag.TOP,
      x1: 0,
      y1: bounds[1],
      x2: containerWidth,
      y2: bounds[1],
    },
    {
      id: BoundFlag.RIGHT,
      x1: bounds[0] + boundsWidth,
      y1: 0,
      x2: bounds[0] + boundsWidth,
      y2: containerHeight,
    },
    {
      id: BoundFlag.BOTTOM,
      x1: 0,
      y1: bounds[1] + boundsHeight,
      x2: containerWidth,
      y2: bounds[1] + boundsHeight,
    },
    {
      id: BoundFlag.LEFT,
      x1: bounds[0],
      y1: 0,
      x2: bounds[0],
      y2: containerHeight,
    },
  ].filter(({ id }) => showBounds.includes(id));

  const boundLines: BoundingLine[] = [
    {
      id: BoundFlag.TOP,
      x1: bounds[0],
      y1: bounds[1],
      x2: bounds[0] + boundsWidth,
      y2: bounds[1],
    },
    {
      id: BoundFlag.RIGHT,
      x1: bounds[0] + boundsWidth,
      y1: bounds[1],
      x2: bounds[0] + boundsWidth,
      y2: bounds[1] + boundsHeight,
    },
    {
      id: BoundFlag.BOTTOM,
      x1: bounds[0] + boundsWidth,
      y1: bounds[1] + boundsHeight,
      x2: bounds[0],
      y2: bounds[1] + boundsHeight,
    },
    {
      id: BoundFlag.LEFT,
      x1: bounds[0],
      y1: bounds[1] + boundsHeight,
      x2: bounds[0],
      y2: bounds[1],
    },
  ].filter(({ id }) => showBounds.includes(id));

  const boundRects = boundLines.reduce<[string, number, number][]>(
    (acc, { x1, y1, x2, y2 }) => {
      if (!acc.find(([, x, y]) => x === x1 && y === y1)) {
        const v = y1 === bounds[1] ? 'min_y' : 'max_y';
        const h = x1 === bounds[0] ? 'min_x' : 'max_x';
        const id = `(${v},${h})`;

        acc.push([id, x1, y1]);
      }

      if (!acc.find(([, x, y]) => x === x2 && y === y2)) {
        const v = y2 === bounds[1] ? 'min_y' : 'max_y';
        const h = x2 === bounds[0] ? 'min_x' : 'max_x';
        const id = `(${v},${h})`;

        acc.push([id, x2, y2]);
      }

      return acc;
    },
    []
  );

  const isLineIntersecting = (line: BoundingLine): boolean => {
    if (line.y1 === line.y2 && extendedLineSegmentToBounds) {
      return (
        extendedLineSegmentToBounds[1] === line.y1 ||
        extendedLineSegmentToBounds[3] === line.y1 ||
        extendedLineSegmentToBounds[1] === line.y2 ||
        extendedLineSegmentToBounds[3] === line.y2
      );
    }

    if (line.x1 === line.x2 && extendedLineSegmentToBounds) {
      return (
        extendedLineSegmentToBounds[0] === line.x1 ||
        extendedLineSegmentToBounds[2] === line.x1 ||
        extendedLineSegmentToBounds[0] === line.x2 ||
        extendedLineSegmentToBounds[2] === line.x2
      );
    }

    return false;
  };

  useEffect(() => {
    return registerObstacle({
      id: 'bounds',
      type: 'bounds',
      geometry: {
        x: 0,
        y: 0,
        width: containerWidth,
        height: containerHeight,
      },
    });
  }, [registerObstacle, containerWidth, containerHeight]);

  return (
    <g>
      <g>
        {containerLines.map((line) => (
          <Line
            key={line.id}
            id={`container-line-${line.id}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            strokeDasharray="4 4"
            opacity={0.5}
          />
        ))}
      </g>

      <g>
        {boundLines.map((line) => (
          <Line
            key={line.id}
            id={`bounds-line-${line.id}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={
              isLineIntersecting(line) ? colorNegativeShade3 : 'currentColor'
            }
            style={{
              filter: isLineIntersecting(line)
                ? `drop-shadow(0 0 8px ${colorNegativeShade5})`
                : undefined,
            }}
          />
        ))}
      </g>

      <g>
        {boundRects.map(([id, x, y]) => (
          <SvgLabel
            id={`bounds-label-${id}}`}
            key={id}
            isVisible
            targetX={x}
            targetY={y}
            text={id}
            paddingHorizontal={2}
            paddingVertical={2}
            monospace
            size="x3"
            backgroundColor="background-shade-2"
            weight="x2"
          />
        ))}
      </g>

      <g>
        {boundRects.map(([id, x, y]) => (
          <Rect
            id={`bounds-rect-${id}}`}
            key={id}
            type="solid"
            x={x - POINT_SIZE * 0.5}
            y={y - POINT_SIZE * 0.5}
            width={POINT_SIZE}
            height={POINT_SIZE}
            fill="currentColor"
            rx={POINT_SIZE * 0.15}
            ry={POINT_SIZE * 0.15}
          />
        ))}
      </g>
    </g>
  );
}
