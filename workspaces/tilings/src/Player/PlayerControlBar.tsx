import { Box, sizeX1Px } from 'preshape';
import { useEffect, useRef } from 'react';
import { usePlayerContext } from './usePlayerContext';

export default function PlayerControlBar() {
  const refInnerBar = useRef<HTMLDivElement>(null);
  const { elapsed, isPlaying } = usePlayerContext();

  useEffect(() => {
    if (!refInnerBar.current) {
      return;
    }

    refInnerBar.current.style.transformOrigin = 'left';

    if (Number.isFinite(elapsed)) {
      refInnerBar.current.style.transform = `scaleX(${elapsed})`;
    } else {
      refInnerBar.current.style.transform = `scaleX(100%)`;
    }
  }, [elapsed, isPlaying]);

  return (
    <Box grow>
      <Box
        backgroundColor="text-shade-1"
        borderRadius="x3"
        container
        height={sizeX1Px}
        overflow="hidden"
      >
        <Box
          absolute="edge-to-edge"
          backgroundColor="accent-shade-3"
          ref={refInnerBar}
        />
      </Box>
    </Box>
  );
}
