import { Box, BoxProps, Text } from 'preshape';
import React, { PropsWithChildren } from 'react';

interface Props extends BoxProps {
  description?: string;
  number: number;
}

const WritingFig = (props: PropsWithChildren<Props>) => {
  const { children, description, number, ...rest } = props;

  return (
    <Box {...rest} basis="100%" grow shrink>
      <Box alignChildrenHorizontal="middle" flex="horizontal" margin="x3">
        {children}
      </Box>

      <Text align="middle" margin="x3">
        <Text inline strong>
          Fig {number}.
        </Text>{' '}
        {description}
      </Text>
    </Box>
  );
};

export default WritingFig;
