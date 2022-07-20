import { Box, Text } from 'preshape';
import React from 'react';

interface Props {
  label: string;
  value: number;
}

const SnakeScoreTile = (props: Props) => {
  const { value, label } = props;

  return (
    <Box
      basis="0"
      borderRadius="x1"
      backgroundColor="background-shade-3"
      grow
      padding="x3"
    >
      <Text align="middle">
        <Text inline size="x5">
          {value}
        </Text>{' '}
        <Text color="shade-3" inline size="x1">
          {label}
        </Text>
      </Text>
    </Box>
  );
};

export default SnakeScoreTile;
