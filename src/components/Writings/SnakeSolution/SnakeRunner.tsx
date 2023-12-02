import SnakeProvider from '../../Projects/Snake/SnakeProvider';
import SnakeRunnerViewer from './SnakeRunnerViewer';

interface Props {
  solution: string;
}

const SnakeRunner = (props: Props) => {
  const { solution } = props;

  return (
    <SnakeProvider solution={solution}>
      <SnakeRunnerViewer solution={solution} />
    </SnakeProvider>
  );
};

export default SnakeRunner;
