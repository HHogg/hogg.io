import { SvgLabel, useSvgLabelsContext } from '@hogg/common';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { formatMs } from '../../utils/formatting';
import { barHeight } from './utils';

type TotalDurationBreakdownSectionProps = {
  name?: string;
  color: string;
  left: number;
  width: number;
  value: number;
  first?: boolean;
  last?: boolean;
};

export default function TotalDurationBreakdownSection({
  name,
  color,
  left,
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
        height: barHeight,
        x: left,
        y: 0,
      },
    });
  }, [registerObstacle, name, left, width]);

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
          targetY={barHeight / 2}
          offsetY={barHeight + 24}
          lineColor="text-shade-3"
        />
      )}

      <g transform={`translate(${left} 0)`}>
        <motion.path
          d={createRectPath({
            width,
            height: barHeight,
            topLeftRadius: first ? barHeight * 0.5 : 0,
            topRightRadius: last ? barHeight * 0.5 : 0,
            bottomRightRadius: last ? barHeight * 0.5 : 0,
            bottomLeftRadius: first ? barHeight * 0.5 : 0,
          })}
          fill={color}
        />
      </g>
    </g>
  );
}

type CreateRectPathProps = {
  width: number;
  height: number;
  topLeftRadius: number;
  topRightRadius: number;
  bottomRightRadius: number;
  bottomLeftRadius: number;
};

function createRectPath({
  width,
  height,
  topLeftRadius,
  topRightRadius,
  bottomRightRadius,
  bottomLeftRadius,
}: CreateRectPathProps) {
  return [
    `M ${topLeftRadius} 0`,
    // Draw a horizontal line to the top right corner, considering top right radius
    `H ${width - topRightRadius}`,
    // Draw an arc for top right corner if radius is greater than 0
    topRightRadius > 0
      ? `A ${topRightRadius} ${topRightRadius} 0 0 1 ${width} ${topRightRadius}`
      : null,
    // Draw a vertical line to the bottom right corner, considering bottom right radius
    `V ${height - bottomRightRadius}`,
    // Draw an arc for bottom right corner if radius is greater than 0
    bottomRightRadius > 0
      ? `A ${bottomRightRadius} ${bottomRightRadius} 0 0 1 ${
          width - bottomRightRadius
        } ${height}`
      : null,
    // Draw a horizontal line to the bottom left corner, considering bottom left radius
    `H ${bottomLeftRadius}`,
    // Draw an arc for bottom left corner if radius is greater than 0
    bottomLeftRadius > 0
      ? `A ${bottomLeftRadius} ${bottomLeftRadius} 0 0 1 0 ${
          height - bottomLeftRadius
        }`
      : null,
    // Draw a vertical line to the top left corner, considering top left radius
    `V ${topLeftRadius}`,
    // Draw an arc for top left corner if radius is greater than 0
    topLeftRadius > 0
      ? `A ${topLeftRadius} ${topLeftRadius} 0 0 1 ${topLeftRadius} 0`
      : null,
    // Close the path
    'Z',
  ]
    .filter((v) => v != null)
    .join(' ');
}
