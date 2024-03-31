import { useSvgLabelsContext } from '@hogg/common';
import { ObstacleType } from '@hogg/common/src/SvgLabels/types';
import { SVGMotionProps, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLineSegmentContext } from '../useLineSegmentContext';

type Props = {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function Rect({
  id,
  type,
  x,
  y,
  width,
  height,
  ...rest
}: SVGMotionProps<SVGRectElement> & Props) {
  const { animate } = useLineSegmentContext();
  const { registerObstacle } = useSvgLabelsContext();

  useEffect(() => {
    return registerObstacle({
      id: `rect-${id}`,
      type,
      geometry: {
        x,
        y,
        width,
        height,
      },
    });
  }, [registerObstacle, id, x, y, width, height, type]);

  return (
    <motion.rect
      animate={{
        x,
        y,
        width,
        height,
      }}
      fill="none"
      initial={{
        x,
        y,
        width,
        height,
      }}
      stroke="currentColor"
      {...rest}
      transition={animate ? undefined : { duration: 0 }}
    />
  );
}
