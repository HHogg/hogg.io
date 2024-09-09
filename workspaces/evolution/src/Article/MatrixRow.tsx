import { Box } from 'preshape';
import { PropsWithChildren } from 'react';

export default function MatrixCell({ children }: PropsWithChildren<{}>) {
  return (
    <Box flex="horizontal" basis="0" gap="x4">
      {children}
    </Box>
  );
}
