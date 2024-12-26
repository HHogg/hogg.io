import { Transform, TransformEccentric } from '@hogg/wasm';
import { Box, List, ListItem, Text } from 'preshape';
import TransformOperationIcon from './TransformOperationIcon';

type Props = {
  transform: Transform;
  transformEccentric: TransformEccentric;
};

const getOrdinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

export default function TransformCardContentEccentric({
  transform,
  transformEccentric,
}: Props) {
  const n = transformEccentric.originIndex.value + 1;
  const ordinal = getOrdinal(n);

  return (
    <Box flex="vertical" alignChildren="middle">
      <List gap="x2">
        <ListItem separator="•">
          <TransformOperationIcon transform={transform} />
        </ListItem>

        <ListItem separator="•">
          <Text weight="x2">
            {n}
            <Text tag="span">{ordinal}</Text>
          </Text>
        </ListItem>

        <ListItem separator="•">
          <Text weight="x2">{transformEccentric.originType}</Text>
        </ListItem>
      </List>
    </Box>
  );
}
