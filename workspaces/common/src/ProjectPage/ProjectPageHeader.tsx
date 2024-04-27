import { Box, BoxProps, Text } from 'preshape';
import { useProjectPageContext } from './useProjectPageContext';

export default function ProjectPageHeader(props: BoxProps) {
  const { name, description, wip } = useProjectPageContext();

  return (
    <Box {...props}>
      <Text margin="x8" size="x7" weight="x5">
        {name}
      </Text>

      <Text margin="x8" size="x5" weight="x2">
        {description}
      </Text>

      {wip && (
        <Text
          backgroundColor="accent-shade-1"
          borderRadius="x1"
          paddingHorizontal="x2"
          paddingVertical="x1"
          tag="strong"
          uppercase
          size="x3"
          weight="x3"
        >
          WIP
        </Text>
      )}
    </Box>
  );
}
