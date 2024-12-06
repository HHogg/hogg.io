import { SvgLabel, useSvgLabelsContext } from '@hogg/common';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { formatMs } from '../../utils/formatting';
import { createRectPath } from './utils';

type TotalDurationBreakdownSectionProps = {
  name?: string;
  color: string;
  left: number;
  height: number;
  width: number;
  value: number;
  first?: boolean;
  last?: boolean;
};

export default function TotalDurationBreakdownSection({
  name,
  color,
  left,
  height,
  width,
  value,
  first,
  last,
}: TotalDurationBreakdownSectionProps) {
  const { registerObstacle } = useSvgLabelsContext();

  useEffect(() => {
    return registerObstacle({
      id: `breakdown-section-rect-${name}`,
      type: 'solid',
      geometry: {
        width,
        height,
        x: left,
        y: 0,
      },
    });
  }, [registerObstacle, height, name, left, width]);

  return (
    <g>
      {name && (
        <SvgLabel
          backgroundColor="background-shade-2"
          borderRadius={4}
          id={`breakdown-section-label-${name}`}
          size="x2"
          weight="x2"
          isVisible
          text={
            <>
              <tspan x={0} textAnchor="middle">
                {name}
              </tspan>
              <tspan x={0} textAnchor="middle" dy="15">
                {formatMs(value)}
              </tspan>
            </>
          }
          textColor="text-shade-1"
          targetX={left + width / 2}
          targetY={height / 2}
          offsetY={height + 24}
          lineColor="text-shade-3"
        />
      )}

      <g transform={`translate(${left} 0)`}>
        <motion.path
          d={createRectPath({
            width,
            height: height,
            topLeftRadius: first ? height * 0.5 : 0,
            topRightRadius: last ? height * 0.5 : 0,
            bottomRightRadius: last ? height * 0.5 : 0,
            bottomLeftRadius: first ? height * 0.5 : 0,
          })}
          fill={color}
        />
      </g>
    </g>
  );
}
