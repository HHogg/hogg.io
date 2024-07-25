import { SvgLabel, extendPointFromOrigin } from '@hogg/common';
import { sizeX8Px, useThemeContext } from 'preshape';
import React, { useCallback, useRef, useState } from 'react';
import { useLineSegmentContext } from '../useLineSegmentContext';
import Rect from './Rect';

const HANDLE_SIZE = 10;

type Props = {
  id: string;
  x: number;
  y: number;
  onChange: (position: [number, number]) => void;
  oppositeX: number;
  oppositeY: number;
};
export default function DragHandle({
  id,
  x,
  y,
  onChange,
  oppositeX,
  oppositeY,
}: Props) {
  const ref = useRef<SVGGElement>(null);
  const { refSvgContainer, setAnimate } = useLineSegmentContext();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { colors } = useThemeContext();

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<SVGCircleElement>) => {
      const { clientX: downX, clientY: downY } = event;
      const targetRect = ref.current?.getBoundingClientRect();

      if (!targetRect) {
        return;
      }

      window.document.body.style.cursor = 'grabbing';
      window.document.body.style.userSelect = 'none';

      setAnimate(false);

      const cx = targetRect.left + targetRect.width / 2;
      const cy = targetRect.top + targetRect.height / 2;
      const offsetX = downX - cx;
      const offsetY = downY - cy;

      const handlePointerMove = (event: PointerEvent) => {
        const { clientX: moveX, clientY: moveY } = event;

        if (refSvgContainer.current) {
          const { left, top } = refSvgContainer.current.getBoundingClientRect();

          onChange([moveX - left - offsetX, moveY - top - offsetY]);
        }
      };

      const handlePointerUp = () => {
        window.document.body.style.cursor = '';
        window.document.body.style.userSelect = '';

        setAnimate(true);

        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [onChange, setAnimate, refSvgContainer]
  );

  const [offsetX, offsetY] = extendPointFromOrigin(
    x,
    y,
    oppositeX,
    oppositeY,
    size.width * 0.5 + sizeX8Px
  );

  return (
    <g>
      <SvgLabel
        id={`drag-handle-label:${id}`}
        isVisible
        offsetX={offsetX}
        offsetY={offsetY}
        targetX={x}
        targetY={y}
        text={id}
        paddingHorizontal={2}
        paddingVertical={2}
        monospace
        size="x3"
        backgroundColor="background-shade-2"
        weight="x2"
        onDimensionsChange={setSize}
      />

      <g onPointerDown={handlePointerDown} ref={ref} style={{ cursor: 'grab' }}>
        <Rect
          id={`drag-handle:${id}`}
          fill="currentColor"
          type="solid"
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          x={x - HANDLE_SIZE * 0.5}
          y={y - HANDLE_SIZE * 0.5}
          stroke={colors.colorBackgroundShade2}
          strokeWidth={2}
        />
      </g>
    </g>
  );
}
