import { Box, BoxProps, Label, Labels, Text } from 'preshape';
import { useProjectPageContext } from './useProjectPageContext';

export default function ProjectPageHeader(props: BoxProps) {
  const { name, description, tags, wip } = useProjectPageContext();

  return (
    <Box {...props}>
      <Text margin="x4" size="x7" weight="x5">
        {name}
      </Text>

      <Text margin="x4" size="x5" weight="x2">
        {description}
      </Text>

      <Labels margin="x4">
        {tags.map((tag) => (
          <Label borderRadius="3px" key={tag}>
            {tag}
          </Label>
        ))}
      </Labels>

      {wip && (
        <Text margin="x6" weight="x2">
          This project is a{' '}
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
            ⚠️ work in progress ⚠️
          </Text>{' '}
          and may not be complete and/or have an accompanying article.
        </Text>
      )}
    </Box>
  );
}
