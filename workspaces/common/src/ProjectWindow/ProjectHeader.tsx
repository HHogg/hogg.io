import { Box, BoxProps } from 'preshape';

export default function ProjectHeader(props: BoxProps) {
  return (
    <Box
      alignChildrenHorizontal="between"
      {...props}
      alignChildrenVertical="middle"
      flex="horizontal"
      gap="x4"
      padding="x4"
      paddingVertical="x2"
    />
  );
}
