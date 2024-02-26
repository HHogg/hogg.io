import { Text } from 'preshape';
import { PropsWithChildren } from 'react';

const NodeBadge = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Text
      backgroundColor="text-shade-1"
      borderRadius="x1"
      className="NodeValidation__badge"
      display="inline-block"
      paddingHorizontal="x1"
      size="x2"
      weight="x2"
      tag="span"
      textColor="background-shade-1"
    >
      {children}
    </Text>
  );
};

export default NodeBadge;
