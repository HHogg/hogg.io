import { DateTime } from 'luxon';
import { Box, BoxProps, Image, Label, Labels, Text } from 'preshape';
import Markdown from '../../../components/Markdown/Markdown';
import { Placement } from '../../../types';

type Props = Placement & BoxProps;

const formatDate = (date: string) =>
  DateTime.fromISO(date).toFormat('MMM yyyy');

export default function TimelineEntry({
  company,
  date,
  description,
  logo,
  tags,
  role,
  ...rest
}: Props) {
  return (
    <Box {...rest} basis="0" grow minWidth="300px">
      <Box alignChildrenVertical="middle" flex="horizontal" gap="x8">
        <Box
          alignChildrenHorizontal="start"
          alignChildrenVertical="middle"
          basis="0"
          flex="horizontal"
          gap="x4"
          grow
        >
          <Box>
            <Image height="44px" src={logo} margin="x2" />
          </Box>

          <Box basis="0" grow>
            <Text weight="x2">{company}</Text>
            <Text textColor="text-shade-1">{role}</Text>
          </Box>
        </Box>

        <Box>
          <Text monospace weight="x3" size="x4">
            {formatDate(date)}
          </Text>
        </Box>
      </Box>

      {description && (
        <Text>
          <Markdown>{description}</Markdown>
        </Text>
      )}

      <Labels margin="x4">
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
