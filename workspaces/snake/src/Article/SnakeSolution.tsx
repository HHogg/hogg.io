import { PlayIcon } from 'lucide-react';
import { Box, Button, CodeBlock, Text } from 'preshape';
import { Solution } from './solutions';

type Props = {
  onSelect: (solution: Solution) => void;
  solution: Solution;
};

const SnakeSolution = ({ onSelect, solution }: Props) => {
  return (
    <Box container>
      <Box
        absolute="bottom-right"
        padding="x6"
        style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,1.0)' }}
      >
        <Button
          color="accent"
          gap="x1"
          variant="primary"
          onClick={() => onSelect(solution)}
        >
          <PlayIcon size="1rem" />
          <Text>Run solution</Text>
        </Button>
      </Box>

      <Box>
        <CodeBlock
          maxHeight="400px"
          padding="x6"
          paddingBottom="x16"
          language="typescript"
          overflow="auto"
          size="x2"
          wrapLines={false}
          wrapLongLines={false}
        >
          {solution.content}
        </CodeBlock>
      </Box>
    </Box>
  );
};

export default SnakeSolution;
