import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { Box, BoxProps, Text } from 'preshape';

type Props = {
  length: number;
};

export default function SequenceLength({ length, ...rest }: Props & BoxProps) {
  return (
    <Box {...rest} alignChildren="middle" flex="horizontal">
      <Box>
        <ArrowLeftIcon size="1rem" />
      </Box>

      <Box borderTop borderSize="x1" borderStyle="dashed" grow></Box>

      <Text size="x2" weight="x2" padding="x2">
        Length: {length}
      </Text>

      <Box borderTop borderSize="x1" borderStyle="dashed" grow></Box>

      <Box>
        <ArrowRightIcon size="1rem" />
      </Box>
    </Box>
  );
}
