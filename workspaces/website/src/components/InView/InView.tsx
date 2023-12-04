import { Box, BoxProps } from 'preshape';
import { useEffect, useRef } from 'react';
import { useIntersection } from 'react-use';

export type InViewProps = BoxProps & {
  onEnter?: () => void;
};

export const InView = ({ onEnter, ...props }: InViewProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const intersected = useIntersection(ref, {
    rootMargin: '-50% 0% -50% 0%',
  });

  useEffect(() => {
    if (intersected?.isIntersecting && onEnter) {
      onEnter();
    }
  }, [intersected?.isIntersecting, onEnter]);

  return <Box {...props} ref={ref} />;
};
