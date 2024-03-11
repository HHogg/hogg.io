import { Box, BoxProps, Image, Label, Labels, Text } from 'preshape';
import Markdown from '../../../components/Markdown/Markdown';
import { Placement } from '../../../types';

type Props = Placement & BoxProps;

export default function TimelineEntry({
  company,
  description,
  logo,
  tags,
  role,
  ...rest
}: Props) {
  return (
    <Box {...rest} basis="0" grow>
      <Box flex="vertical" gap="x8">
        <Box
          alignChildrenHorizontal="start"
          alignChildrenVertical="middle"
          flex="horizontal"
          gap="x4"
        >
          <Box>
            <Image height="44px" src={logo} margin="x2" />
          </Box>

          <Box basis="0" grow>
            <Text weight="x2">{company}</Text>
            <Text>{role}</Text>
          </Box>
        </Box>
      </Box>

      <Text>
        <Markdown>{description}</Markdown>
      </Text>

      <Labels>
        {tags.map((tag) => (
          <Label
            key={tag}
            size="x2"
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
    </Box>
  );
}
