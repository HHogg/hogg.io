import { Box, Code, Text } from 'preshape';
import React, { PropsWithChildren } from 'react';

interface Props {
  angle: string;
  continuous?: boolean;
  example: string;
}

const TransformFunctionStats = ({
  angle,
  continuous,
  example,
}: PropsWithChildren<Props>) => {
  return (
    <Box>
      <Text><Text inline>Example:</Text> <Code strong>{ example }</Code></Text>
      <Text><Text inline>Continuous:</Text> <Code strong>{ continuous ? 'Yes' : 'No' }</Code></Text>
      <Text><Text inline>Angle:</Text> <Code strong>{ angle }</Code></Text>
    </Box>
  );
};

export default TransformFunctionStats;
