import { Text } from 'preshape';
import React, { FunctionComponent } from 'react';

interface Props {}

const NodeBadge: FunctionComponent<Props> = ({ children }) => {
  return (
    <Text
      backgroundColor="background-shade-1"
      className="NodeValidation__badge"
      size="x2"
      strong
      textColor="text-shade-1"
    >
      {children}
    </Text>
  );
};

export default NodeBadge;
