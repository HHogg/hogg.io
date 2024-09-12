import { Box, BoxProps } from 'preshape';

export default function StageCard(props: BoxProps) {
  return (
    <Box
      {...props}
      basis="0"
      grow
      backgroundColor="background-shade-3"
      borderColor="background-shade-4"
      borderSize="x1"
      borderRadius="x3"
    />
  );
}
