import { Box } from 'preshape';
import SnakeScoreTile from './SnakeScoreTile';
import { useSnakeContext } from './useSnakeContext';
import getAverage from './utils/getAverage';
import getPoints from './utils/getPoints';
import getScore from './utils/getScore';

const SnakeScoreTiles = () => {
  const { history, xLength, yLength } = useSnakeContext();

  return (
    <Box flex="horizontal" gap="x2">
      <SnakeScoreTile label="Points" value={getPoints(history)} />
      <SnakeScoreTile label="Average" value={Math.floor(getAverage(history))} />
      <SnakeScoreTile
        label="Score"
        value={Math.floor(getScore(xLength, yLength, history))}
      />
    </Box>
  );
};

export default SnakeScoreTiles;
