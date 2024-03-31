import { useSvgLabelsContext } from '@hogg/common';
import { ObstacleType } from '@hogg/common/src/SvgLabels/types';
import { SVGMotionProps, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLineSegmentContext } from '../useLineSegmentContext';

type Props = {
  id: string;
  r: number;
  type: ObstacleType;
  x: number;
  y: number;
};

export default function Circle({
  id,
  r,
  type,
  x,
  y,
  ...rest
}: SVGMotionProps<SVGCircleElement> & Props) {
  const { animate } = useLineSegmentContext();
  const { registerObstacle } = useSvgLabelsContext();

  useEffect(() => {
    return registerObstacle({
      id: `Circle:${id}`,
      type,
      geometry: {
        radius: r,
        x,
        y,
      },
    });
  }, [registerObstacle, id, r, x, y, type]);

  return (
    <motion.circle
      animate={{
        cx: x,
        cy: y,
        r,
      }}
      fill="none"
      initial={{
        cx: x,
        cy: y,
        r: 0,
      }}
      stroke="currentColor"
      {...rest}
      transition={animate ? undefined : { duration: 0 }}
    />
  );
}
