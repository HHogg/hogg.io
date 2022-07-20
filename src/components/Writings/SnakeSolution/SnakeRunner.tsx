import React, { useRef } from 'react';
import SnakeProvider from '../../Projects/Snake/SnakeProvider';
import SnakeRunnerViewer from './SnakeRunnerViewer';

interface Props {
  solution: string;
}

const SnakeRunner = (props: Props) => {
  const { solution } = props;
  const worker = useRef(
    new Worker('../../Projects/Snake/SnakeRunnerWorker.ts')
  );

  return (
    <SnakeProvider solution={solution} worker={worker.current}>
      <SnakeRunnerViewer solution={solution} />
    </SnakeProvider>
  );
};

export default SnakeRunner;
