import { Appear, Box, Text } from 'preshape';
import { useSnakeContext } from './useSnakeContext';
import getAverage from './utils/getAverage';
import getScore from './utils/getScore';

export default function SnakeScores() {
  const { history, xLength, yLength } = useSnakeContext();

  const points = history.length - 1;
  const average = Math.floor(getAverage(history.slice(0, -1)));
  const score = Math.floor(getScore(xLength, yLength, history.slice(0, -1)));

  const stats = [
    ['Average moves', average],
    ['Total points', points],
    ['Total score', score],
  ];

  return (
    <Appear
      animation="FadeSlideUp"
      flex="horizontal"
      gap="x8"
      visible={points > 0}
    >
      {stats.map(([label, value]) => (
        <Box key={label}>
          <Text align="middle" size="x6" weight="x5">
            {value}
          </Text>

          <Text align="middle" size="x3" weight="x2">
            {label}
          </Text>
        </Box>
      ))}
    </Appear>
  );
}
