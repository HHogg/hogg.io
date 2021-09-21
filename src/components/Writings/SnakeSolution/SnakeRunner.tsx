import { Snake } from '@hhogg/snake';
import * as React from 'react';
import SnakeRunnerViewer from './SnakeRunnerViewer';

interface Props {
  solution: string;
}

export default (props: Props) => {
  const { solution } = props;
  const worker = React.useRef(new Worker('../../../../node_modules/@hhogg/snake/src/SnakeRunnerWorker.js'));

  return (
    <Snake
        solution={ solution }
        worker={ worker.current }>
      <SnakeRunnerViewer solution={ solution } />
    </Snake>
  );
};
