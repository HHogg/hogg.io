import { Box, BoxProps, Label, Labels, Text } from 'preshape';
import { useProjectPageContext } from './useProjectPageContext';

export default function ProjectPageHeader(props: BoxProps) {
  const { name, description, tags, wip } = useProjectPageContext();

  return (
    <Box {...props}>
      <Text margin="x8" size="x7" weight="x5">
        {name}
      </Text>

      <Text margin="x8" size="x5" weight="x2">
        {description}
      </Text>

      <Labels margin="x8">
        {tags.map((tag) => (
          <Label
            key={tag}
            size="x3"
            backgroundColor="background-shade-3"
            textColor="text-shade-1"
            borderRadius="3px"
            borderSize="x1"
            borderColor="background-shade-4"
          >
            {tag}
          </Label>
        ))}
      </Labels>

      {wip && (
        <Text margin="x16" weight="x2">
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
