import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import SolutionRunner from './SolutionRunner';
import { TypeCell, TypeHistory, TypeValues } from './types';
import { SnakeContext } from './useSnakeContext';
import getSurroundingCells from './utils/getSurroundingCells';
import { createBlock, moveForwards, moveBackwards } from './utils/history';
import isCellIncluded from './utils/isCellIncluded';

interface Props {
  solution: string;
  xLength?: number;
  yLength?: number;
}

const SnakeProvider = (props: PropsWithChildren<Props>) => {
  const { solution, xLength = 15, yLength = 15, ...rest } = props;

  const refAnimationFrame = useRef<number>();
  const refSolutionRunner = useRef<SolutionRunner>();
  const [isStarted, setIsStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<TypeHistory>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [values, setValues] = useState<TypeValues>();

  const level = history[history.length - 1];
  const snake = level && level.snake;
  const point = level && level.point;

  const handleReset = () => {
    if (refAnimationFrame.current) {
      cancelAnimationFrame(refAnimationFrame.current);
    }

    setIsStarted(false);
    setIsRunning(false);
    setValues(undefined);
    setHistory([]);
  };

  const handleLog = useCallback(
    (log: string) => {
      setLogs([log, ...logs]);
    },
    [logs]
  );

  const runSolution = useCallback(() => {
    if (point && snake) {
      refSolutionRunner.current?.run({
        fn: solution,
        env: {
          xMax: xLength,
          yMax: yLength,
          snake: snake,
          point: point,
        },
      });
    } else if (snake.length === xLength * yLength) {
      setIsRunning(false);
      handleLog('🎉 You have conquered Snake! 🎉');
    }
  }, [point, snake, xLength, yLength, solution, handleLog]);

  const moveSnake = useCallback(() => {
    if (!Array.isArray(values)) {
      setIsRunning(false);

      return handleLog(
        '🔥 There were no heuristic values to calculate a move 🔥'
      );
    }

    if (!snake || !point) {
      setIsRunning(false);

      return handleLog('Press start!');
    }

    const cells = getSurroundingCells(xLength, yLength, snake);
    let nextValue;
    let nextCell: TypeCell | undefined;

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
      setIsRunning(false);

      return handleLog(
        'The 🐍 did not reach the point. There were no valid cells to move to.'
      );
    }

    if (isCellIncluded([nextCell], point) && snake) {
      setHistory(
        createBlock(xLength, yLength, moveForwards(history, nextCell, true))
      );
    } else {
      setHistory(moveForwards(history, nextCell));
    }
  }, [values, snake, point, xLength, yLength, handleLog, history]);

  useEffect(() => {
    refSolutionRunner.current = new SolutionRunner();

    return () => {
      refSolutionRunner.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (refSolutionRunner.current) {
      refSolutionRunner.current.onMessage = ({ values }) => {
        if (isStarted) {
          setValues(values);
        }
      };

      refSolutionRunner.current.onError = ({ message }) => {
        setIsRunning(false);
        handleLog(message);
      };

      if (!isStarted) {
        refSolutionRunner.current?.reset();
      }
    }
  }, [isStarted, isRunning, handleLog]);

  useEffect(() => {
    if (!point || !snake) {
      setValues(undefined);
      setHistory(createBlock(xLength, yLength, history));
    }
  }, [history, point, snake, xLength, yLength]);

  useEffect(() => {
    if (isStarted) {
      runSolution();
    }
  }, [isStarted, point, runSolution, snake]);

  useEffect(() => {
    if (isRunning && values) {
      refAnimationFrame.current = requestAnimationFrame(() => {
        moveSnake();
      });
    }
  }, [isRunning, moveSnake, values]);

  return (
    <SnakeContext.Provider
      {...rest}
      value={{
        history: history,
        isRunning: isRunning,
        isStarted: isStarted,
        logs: logs,
        onClearLog: () => setLogs([]),
        onPause: () => setIsRunning(false),
        onPlay: () => setIsRunning(true),
        onRefresh: () => runSolution(),
        onReset: () => handleReset(),
        onStart: () => setIsStarted(true),
        onStepBackwards: () => setHistory(moveBackwards(history)),
        onStepForwards: () => moveSnake(),
        point: point,
        snake: snake,
        values: values,
        xLength: xLength,
        yLength: yLength,
      }}
    />
  );
};

export default SnakeProvider;
