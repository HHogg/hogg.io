import { Transform, TransformContinuous } from '@hogg/wasm';
import { Box, List, ListItem, Text } from 'preshape';
import TransformOperationIcon from './TransformOperationIcon';

type Props = {
  transform: Transform;
  transformContinuous: TransformContinuous;
};

export default function TransformCardContentContinuous({
  transform,
  transformContinuous,
}: Props) {
  return (
    <Box flex="horizontal" alignChildren="middle">
      <List gap="x2">
        <ListItem separator="•">
          <TransformOperationIcon transform={transform} />
        </ListItem>

        <ListItem separator="•">
          <Text weight="x2">
            {transformContinuous.value.value}
            <Text tag="span">°</Text>
          </Text>
        </ListItem>

        <ListItem separator="•">
          <Text weight="x2">
            {Math.round(Math.log2(360 / transformContinuous.value.value))} times
          </Text>
        </ListItem>
      </List>
    </Box>
  );
}
