import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import SolutionRunner from './SolutionRunner';
import { Cell, History, Values } from './types';
import { SnakeContext } from './useSnakeContext';
import getSurroundingCells from './utils/getSurroundingCells';
import { createBlock, moveForwards, moveBackwards } from './utils/history';
import isCellIncluded from './utils/isCellIncluded';

interface Props {
  autoRun?: boolean;
  solution: string;
  xLength?: number;
  yLength?: number;
}

const SnakeProvider = ({
  autoRun = false,
  solution,
  xLength = 15,
  yLength = 15,
  ...rest
}: PropsWithChildren<Props>) => {
  const refAnimationFrame = useRef<number>();
  const refSolutionRunner = useRef<SolutionRunner>();

  const [isRunning, setIsRunning] = useState(autoRun);
  const [history, setHistory] = useState<History>(
    createBlock(xLength, yLength, [])
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [values, setValues] = useState<Values | null>(null);

  const { snake, point } = history[history.length - 1];

  const handleLog = (log: string) => {
    setLogs((logs) => [log, ...logs]);
  };

  const run = useCallback(() => {
    setHistory((prevHistory) => {
      const { snake, point } = prevHistory[prevHistory.length - 1];

      //
      if (values === null || values.length === 0) {
        handleLog(
          'The 🐍 did not reach the point. There were no cells to move to.'
        );

        return prevHistory;
      }

      // The snake is full.
      if (point === null) {
        handleLog('🎉 Complete! 🎉');

        return prevHistory;
      }

      const cells = getSurroundingCells(xLength, yLength, snake);

      let nextValue: number | undefined = undefined;
      let nextCell: Cell | undefined = undefined;

      for (let i = 0; i < cells.length; i++) {
        if (snake.length === xLength * yLength - 1 && cells.length === 2) {
          if (isCellIncluded([cells[i]], point)) {
            nextValue = values[cells[i][1]][cells[i][0]];
            nextCell = cells[i];
          }
        } else {
          if (
            nextValue === undefined ||
            values[cells[i][1]][cells[i][0]] < nextValue
          ) {
            nextValue = values[cells[i][1]][cells[i][0]];
            nextCell = cells[i];
          }
        }
      }

      if (!nextCell) {
        handleLog(
          'The 🐍 did not reach the point. There were no valid cells to move to.'
        );

        return prevHistory;
      }

      if (nextCell) {
        return moveForwards(prevHistory, xLength, yLength, nextCell);
      }

      return prevHistory;
    });
  }, [values, xLength, yLength]);

  const handleReset = useCallback(() => {
    if (refAnimationFrame.current) {
      cancelAnimationFrame(refAnimationFrame.current);
    }

    refSolutionRunner.current?.reset();

    setIsRunning(autoRun);
    setValues([]);
    setHistory(createBlock(xLength, yLength, []));
  }, [autoRun, xLength, yLength]);

  const handlePlay = useCallback(() => {
    setIsRunning(true);
  }, [setIsRunning]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, [setIsRunning]);

  const handleStepBackwards = useCallback(() => {
    setIsRunning(false);
    setHistory((history) => moveBackwards(history));
  }, [setHistory]);

  const handleStepForwards = useCallback(() => {
    setIsRunning(false);
    run();
  }, [run]);

  useEffect(() => {
    if (!refSolutionRunner.current) {
      refSolutionRunner.current = new SolutionRunner();
      refSolutionRunner.current.onMessage = ({ values }) => {
        setValues(values);
      };

      refSolutionRunner.current.onError = ({ message }) => {
        console.error(message);
        setIsRunning(false);
        handleLog(message);
      };

      return () => {
        refSolutionRunner.current?.destroy();
        refSolutionRunner.current = undefined;
      };
    }
  }, []);

  useEffect(() => {
    if (point) {
      refSolutionRunner.current?.run({
        fn: solution,
        env: {
          xMax: xLength,
          yMax: yLength,
          snake: snake,
          point: point,
        },
      });
    }
  }, [xLength, yLength, snake, point, solution]);

  useEffect(() => {
    if (isRunning) {
      refAnimationFrame.current = requestAnimationFrame(run);
    }

    return () => {
      if (refAnimationFrame.current) {
        cancelAnimationFrame(refAnimationFrame.current);
      }
    };
  }, [isRunning, run]);

  useEffect(() => {
    if (autoRun) {
      handlePlay();
    }
  }, [autoRun, handlePlay]);

  useEffect(() => {
    handleReset();
  }, [handleReset, solution]);

  return (
    <SnakeContext.Provider
      {...rest}
      value={{
        solution,
        history,
        isRunning,
        logs,
        point,
        snake,
        values,
        xLength,
        yLength,
        clearLog: () => setLogs([]),
        pause: handlePause,
        play: handlePlay,
        reset: handleReset,
        stepBackwards: handleStepBackwards,
        stepForwards: handleStepForwards,
      }}
    />
  );
};

export default SnakeProvider;
