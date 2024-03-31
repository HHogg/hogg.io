import { ProjectWindow } from '@hogg/common';
import { Box, useResizeObserver } from 'preshape';
import SpiralsVisual from './SpiralsVisual';

const SpiralsProjectWindow = () => {
  const [size, ref] = useResizeObserver();

  return (
    <ProjectWindow
      backgroundPattern="grid"
      backgroundPatternGap={25}
      shadow
      theme="night"
    >
      <Box flex="vertical" grow>
        <Box container grow>
          <Box absolute="edge-to-edge" ref={ref}>
            {!!(size.height && size.width) && (
              <SpiralsVisual height={size.height} width={size.width} />
            )}
          </Box>
        </Box>
      </Box>
    </ProjectWindow>
  );
};

export default SpiralsProjectWindow;
