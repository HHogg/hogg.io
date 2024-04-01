import { Box } from 'preshape';
import { useCallback, useMemo } from 'react';
import DragHandle from '../Shapes/DragHandle';
import Line from '../Shapes/Line';
import { useLineSegmentContext } from '../useLineSegmentContext';

export default function OriginalLineSegment() {
  const {
    x1,
    y1,
    x2,
    y2,
    setPoints1,
    setPoints2,
    containerWidth: width,
    containerHeight: height,
    showLineSegment,
  } = useLineSegmentContext();

  const createDragHandler = useCallback(
    (update: (p: [number, number]) => void) =>
      ([x, y]: [number, number]) => {
        const xClamped = Math.max(0, Math.min(width, x));
        const yClamped = Math.max(0, Math.min(height, y));

        update([xClamped, yClamped]);
      },
    [height, width]
  );

  const handleDrag1 = useMemo(
    () => createDragHandler(setPoints1),
    [createDragHandler, setPoints1]
  );

  const handleDrag2 = useMemo(
    () => createDragHandler(setPoints2),
    [createDragHandler, setPoints2]
  );

  if (!showLineSegment) {
    return null;
  }

  return (
    <Box tag="g" textColor="text-shade-1">
      <Line
        id="original-line-segment"
        x1={x1}
        x2={x2}
        y1={y1}
        y2={y2}
        stroke="currentColor"
        strokeWidth={3}
      />

      <DragHandle
        id="(x1,y1)"
        x={x1}
        y={y1}
        onChange={handleDrag1}
        oppositeX={x2}
        oppositeY={y2}
      />

      <DragHandle
        id="(x2,y2)"
        x={x2}
        y={y2}
        onChange={handleDrag2}
        oppositeX={x1}
        oppositeY={y1}
      />
    </Box>
  );
}
