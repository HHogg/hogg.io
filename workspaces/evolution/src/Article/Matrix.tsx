import { Box, Text } from 'preshape';
import MatrixCell from './MatrixCell';
import MatrixDots from './MatrixDots';
import MatrixRow from './MatrixRow';

type Props = {
  name: string;
  letters: [string, string, string];
};

export default function Matrix({ name, letters: [a, b, c] }: Props) {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  const cLower = c.toLowerCase();

  return (
    <Text flex="horizontal" alignChildrenVertical="middle" gap="x4" monospace>
      <Text>
        <Text size="x5" strong>
          {name}
        </Text>{' '}
        =
      </Text>

      <Text
        borderLeft
        borderRight
        borderSize="x1"
        borderRadius="x3"
        paddingHorizontal="x6"
      >
        <Box flex="vertical" gap="x4">
          <MatrixRow>
            <MatrixCell a={aLower} b="1" c="1" />
            <MatrixCell a={aLower} b="1" c="2" />
            <MatrixDots h />
            <MatrixCell a={aLower} b="1" c={cLower} />
          </MatrixRow>

          <MatrixRow>
            <MatrixCell a={aLower} b="2" c="1" />
            <MatrixCell a={aLower} b="2" c="2" />
            <MatrixDots h />
            <MatrixCell a={aLower} b="2" c={cLower} />
          </MatrixRow>

          <MatrixRow>
            <MatrixDots v />
            <MatrixDots v />
            <MatrixDots d />
            <MatrixDots v />
          </MatrixRow>

          <MatrixRow>
            <MatrixCell a={aLower} b={bLower} c="1" />
            <MatrixCell a={aLower} b={bLower} c="2" />
            <MatrixDots h />
            <MatrixCell a={aLower} b={bLower} c={cLower} />
          </MatrixRow>
        </Box>
      </Text>
    </Text>
  );
}
