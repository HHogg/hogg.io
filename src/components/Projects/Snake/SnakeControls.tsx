import {
  useMatchMedia,
  Button,
  Buttons,
  Box,
  Icons,
  Tooltip,
  BoxProps,
} from 'preshape';
import React from 'react';
import { useSnakeContext } from './SnakeProvider';

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
            {(props) => (
              <Button
                {...props}
                disabled={isAtBeginning || !isStarted || isRunning}
                grow
                onClick={() => onStepBackwards()}
                size="x3"
              >
                <Icons.SkipBack size="1rem" />
              </Button>
            )}
          </Tooltip>

          <Tooltip content="Play">
            {(props) => (
              <Button
                {...props}
                disabled={!isStarted || isRunning}
                grow
                onClick={() => onPlay()}
                size="x3"
              >
                <Icons.Play size="1rem" />
              </Button>
            )}
          </Tooltip>

          <Tooltip content="Pause">
            {(props) => (
              <Button
                {...props}
                disabled={!isStarted || !isRunning}
                grow
                onClick={() => onPause()}
                size="x3"
              >
                <Icons.Pause size="1rem" />
              </Button>
            )}
          </Tooltip>

          <Tooltip content="Step forward">
            {(props) => (
              <Button
                {...props}
                disabled={!isStarted || isRunning}
                grow
                onClick={() => onStepForwards()}
                size="x3"
              >
                <Icons.SkipForward size="1rem" />
              </Button>
            )}
          </Tooltip>

          <Tooltip content="Refresh values">
            {(props) => (
              <Button
                {...props}
                disabled={!isStarted || isRunning}
                grow
                onClick={() => onRefresh()}
                size="x3"
              >
                <Icons.RefreshCw size="1rem" />
              </Button>
            )}
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
