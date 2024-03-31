import { useSvgLabelsContext } from '@hogg/common';
import { motion, SVGMotionProps } from 'framer-motion';
import { useEffect } from 'react';
import { useLineSegmentContext } from '../useLineSegmentContext';

type Props = {
  id: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export default function Line({
  id,
  x1,
  x2,
  y1,
  y2,
  ...props
}: Props & SVGMotionProps<SVGLineElement>) {
  const { registerObstacle } = useSvgLabelsContext();
  const { animate } = useLineSegmentContext();

  useEffect(() => {
    return registerObstacle({
      id,
      type: 'solid',
      geometry: {
        x1,
        x2,
        y1,
        y2,
      },
    });
  }, [registerObstacle, id, x1, x2, y1, y2]);

  return (
    <motion.line
      fill="none"
      stroke="currentColor"
      {...props}
      animate={{
        x1,
        x2,
        y1,
        y2,
      }}
      initial={{
        x1,
        x2,
        y1,
        y2,
      }}
      strokeLinecap="round"
      transition={animate ? undefined : { duration: 0 }}
    />
  );
}
