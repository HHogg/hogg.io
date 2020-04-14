import * as React from 'react';
import { Flex, FlexProps, Text } from 'preshape';

interface Props extends FlexProps {
  description?: string;
  number: number;
}

export default (props: React.PropsWithChildren<Props>) => {
  const { children, description, number, ...rest } = props;

  return (
    <Flex { ...rest } basis="container" grow shrink>
      <Flex
          alignChildrenHorizontal="middle"
          direction="horizontal"
          margin="x3">
        { children }
      </Flex>

      <Text
          align="middle"
          margin="x3">
        <Text inline strong>Fig { number }.</Text> { description }</Text>
    </Flex>
  );
};
