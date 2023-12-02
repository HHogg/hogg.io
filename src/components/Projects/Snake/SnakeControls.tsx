import {
  PauseIcon,
  PlayIcon,
  RefreshCwIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from 'lucide-react';
import {
  useMatchMedia,
  Button,
  Buttons,
  Box,
  Tooltip,
  BoxProps,
} from 'preshape';
import { useSnakeContext } from './useSnakeContext';

const SnakeControls = (props: BoxProps) => {
  const {
    history,
    isStarted,
    isRunning,
    onPause,
    onPlay,
    onRefresh,
    onReset,
    onStart,
    onStepBackwards,
    onStepForwards,
  } = useSnakeContext();

  const isAtBeginning = history[0] && !history[0].path.length;
  const match = useMatchMedia(['600px']);

  return (
    <Box {...props} flex={match('600px') ? 'horizontal' : 'vertical'} gap="x3">
      <Box flex="horizontal" grow>
        <Buttons grow>
          <Button
            color="positive"
            disabled={isStarted}
            grow
            onClick={() => onStart()}
            size="x3"
            title="Start the game"
          >
            Start
          </Button>
        </Buttons>
      </Box>

      <Box flex="horizontal" grow>
        <Buttons grow joined>
          <Tooltip content="Step Backward">
            <Button
              disabled={isAtBeginning || !isStarted || isRunning}
              grow
              onClick={() => onStepBackwards()}
              size="x3"
            >
              <SkipBackIcon size="1rem" />
            </Button>
          </Tooltip>

          <Tooltip content="Play">
            <Button
              disabled={!isStarted || isRunning}
              grow
              onClick={() => onPlay()}
              size="x3"
            >
              <PlayIcon size="1rem" />
            </Button>
          </Tooltip>

          <Tooltip content="Pause">
            <Button
              disabled={!isStarted || !isRunning}
              grow
              onClick={() => onPause()}
              size="x3"
            >
              <PauseIcon size="1rem" />
            </Button>
          </Tooltip>

          <Tooltip content="Step forward">
            <Button
              disabled={!isStarted || isRunning}
              grow
              onClick={() => onStepForwards()}
              size="x3"
            >
              <SkipForwardIcon size="1rem" />
            </Button>
          </Tooltip>

          <Tooltip content="Refresh values">
            <Button
              disabled={!isStarted || isRunning}
              grow
              onClick={() => onRefresh()}
              size="x3"
            >
              <RefreshCwIcon size="1rem" />
            </Button>
          </Tooltip>
        </Buttons>
      </Box>

      <Box flex="horizontal" grow>
        <Buttons grow>
          <Button
            color="negative"
            disabled={!isStarted}
            grow
            onClick={() => onReset()}
            size="x3"
            title="Reset the Snake back to starting position"
          >
            Reset
          </Button>
        </Buttons>
      </Box>
    </Box>
  );
};

export default SnakeControls;
