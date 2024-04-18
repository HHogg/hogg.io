import {
  Media,
  ProjectControl,
  ProjectControlGroup,
  ProjectControls,
  ProjectProgressBar,
} from '@hogg/common';
import {
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  PauseIcon,
  PlayIcon,
} from 'lucide-react';
import { Box } from 'preshape';
import { useSnakeContext } from './useSnakeContext';

const SnakeControls = () => {
  const {
    history,
    isRunning,
    snake,
    xLength,
    yLength,
    pause,
    play,
    reset,
    stepBackwards,
    stepForwards,
  } = useSnakeContext();

  const initialSnakeLength = history[0]?.snake.length ?? 0;
  const currentSnakeLength = snake?.length ?? 0;
  const possibleSnakeLength = xLength * yLength;

  const elapsed =
    (currentSnakeLength - initialSnakeLength) /
    (possibleSnakeLength - initialSnakeLength);

  return (
    <ProjectControls>
      <ProjectControlGroup>
        {isRunning ? (
          <ProjectControl Icon={PauseIcon} onClick={pause} title="Pause" />
        ) : (
          <ProjectControl Icon={PlayIcon} onClick={play} title="Play" />
        )}
      </ProjectControlGroup>

      <Box alignChildren="middle" flex="horizontal" gap="x6" grow>
        <ProjectControlGroup>
          <ProjectControl
            Icon={ChevronFirst}
            onClick={reset}
            title="Beginning"
          />

          <ProjectControl
            Icon={ChevronLeft}
            onClick={stepBackwards}
            title="Step backwards"
            disabled={history.length === 1 && history[0]?.path.length === 0}
          />
        </ProjectControlGroup>

        <Media greaterThanOrEqual="desktop" grow>
          <ProjectProgressBar elapsed={elapsed} />
        </Media>

        <ProjectControlGroup>
          <ProjectControl
            Icon={ChevronRight}
            onClick={stepForwards}
            title="Step forwards"
          />
        </ProjectControlGroup>
      </Box>
    </ProjectControls>
  );
};

export default SnakeControls;
