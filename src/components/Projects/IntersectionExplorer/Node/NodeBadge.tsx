import { Text } from 'preshape';
import { PropsWithChildren } from 'react';

const NodeBadge = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Text
      backgroundColor="text-shade-1"
      className="NodeValidation__badge"
      size="x2"
      weight="x2"
      textColor="background-shade-1"
    >
      {children}
    </Text>
  );
};

export default NodeBadge;
