import { Snake } from '@hhogg/snake';
import React, { useRef } from 'react';
import SnakeRunnerViewer from './SnakeRunnerViewer';

interface Props {
  solution: string;
}

const SnakeRunner = (props: Props) => {
  const { solution } = props;
  const worker = useRef(
    new Worker('../../../../node_modules/@hhogg/snake/src/SnakeRunnerWorker.js')
  );

  return (
    <Snake solution={solution} worker={worker.current}>
      <SnakeRunnerViewer solution={solution} />
    </Snake>
  );
};

export default SnakeRunner;
