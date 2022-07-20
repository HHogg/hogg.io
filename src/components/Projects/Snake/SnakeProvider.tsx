import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import SolutionRunner from './SolutionRunner';
import {
  TypeCell,
  TypeHistory,
  TypePoint,
  TypeSnake,
  TypeValues,
} from './types';
import getSurroundingCells from './utils/getSurroundingCells';
import { createBlock, moveForwards, moveBackwards } from './utils/history';
import isCellIncluded from './utils/isCellIncluded';

interface Props {
  solution: string;
  timeout?: number;
  worker: Worker;
  xLength?: number;
  yLength?: number;
}

export const SnakeContext = createContext<{
  history: TypeHistory;
  isStarted: boolean;
  isRunning: boolean;
  logs: string[];
  onClearLog: () => void;
  onPause: () => void;
  onPlay: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onStart: () => void;
  onStepBackwards: () => void;
  onStepForwards: () => void;
  point: undefined | TypePoint;
  snake: undefined | TypeSnake;
  values: undefined | TypeValues;
  xLength: number;
  yLength: number;
}>({
  history: [],
  isStarted: false,
  isRunning: false,
  logs: [],
  onClearLog: () => {},
  onPause: () => {},
  onPlay: () => {},
  onRefresh: () => {},
  onReset: () => {},
  onStart: () => {},
  onStepBackwards: () => {},
  onStepForwards: () => {},
  point: undefined,
  snake: undefined,
  values: undefined,
  xLength: 15,
  yLength: 15,
});

export const useSnakeContext = () => useContext(SnakeContext);

const SnakeProvider: FC<Props> = (props) => {
  const {
    solution,
    timeout = 1000,
    worker,
    xLength = 15,
    yLength = 15,
    ...rest
  } = props;

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

  const handleLog = (log: string) => {
    setLogs([log, ...logs]);
  };

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
  }, [solution, point, snake]);

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
  }, [values, snake, point]);

  useEffect(() => {
    refSolutionRunner.current = new SolutionRunner({ timeout, worker });

    return () => {
      refSolutionRunner.current?.destroy();
    };
  }, [timeout, worker]);

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
        refSolutionRunner.current.reset();
      }
    }
  }, [isStarted, isRunning]);

  useEffect(() => {
    if (!point || !snake) {
      setValues(undefined);
      setHistory(createBlock(xLength, yLength, history));
    }
  }, [point, snake]);

  useEffect(() => {
    if (isStarted) {
      runSolution();
    }
  }, [isStarted, point, snake]);

  useEffect(() => {
    if (isRunning && values) {
      refAnimationFrame.current = requestAnimationFrame(() => {
        moveSnake();
      });
    }
  }, [isRunning, values]);

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
