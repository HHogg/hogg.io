import { Box, BoxProps } from 'preshape';

export default function ProjectControls(props: BoxProps) {
  return (
    <Box
      {...props}
      alignChildrenHorizontal="between"
      alignChildrenVertical="middle"
      flex="horizontal"
      gap="x4"
      padding="x4"
    />
  );
}
