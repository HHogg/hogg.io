import { useSvgLabelsContext } from '@hogg/common';
import { SVGMotionProps, motion } from 'framer-motion';
import { useResizeObserver, Text as PreshapeText, TextProps } from 'preshape';
import { useEffect } from 'react';
import { useLineSegmentContext } from '../useLineSegmentContext';

type Props = {
  id: string;
  x: number;
  y: number;
  text: string;
  paddingHorizontal?: number;
  paddingVertical?: number;
  translateX?: number;
  translateY?: number;
};

export default function Text({
  id,
  x,
  y,
  text,
  paddingHorizontal = 0,
  paddingVertical = 0,
  translateX = 0,
  translateY = 0,
  ...rest
}: SVGMotionProps<SVGTextElement> &
  Omit<TextProps, 'paddingHorizontal' | 'paddingVertical'> &
  Props) {
  const { animate } = useLineSegmentContext();
  const { registerObstacle } = useSvgLabelsContext();
  const [size, setSize] = useResizeObserver<SVGTextElement>();

  const height = size?.height + paddingVertical * 2;
  const width = size?.width + paddingHorizontal * 2;

  const translatedX = x + translateX * width;
  const translatedY = y + translateY * height;

  useEffect(() => {
    return registerObstacle({
      id: `Text:${id}`,
      type: 'solid',
      geometry: {
        width,
        height,
        x,
        y,
      },
    });
  }, [registerObstacle, id, x, y, width, height]);

  return (
    <motion.g
      ref={setSize}
      animate={{ x: translatedX, y: translatedY }}
      transition={animate ? undefined : { duration: 0 }}
    >
      <PreshapeText
        {...rest}
        fill="currentColor"
        tag="text"
        alignmentBaseline="middle"
        textAnchor="middle"
      >
        {text}
      </PreshapeText>
    </motion.g>
  );
}
