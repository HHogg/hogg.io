import { Node, Edge } from '@hogg/circle-intersections';
import { Box, Text } from 'preshape';
import { FunctionComponent } from 'react';
import NodeValidationBadge from '../Node/NodeBadge';

type Props = {
  node: Node | Edge;
};

const NodeTooltipContentCurrent: FunctionComponent<Props> = (props) => {
  const { node } = props;

  return (
    <Box alignChildren="middle" flex="vertical">
      <NodeValidationBadge>Node {node.index}</NodeValidationBadge>
      <Text margin="x2" size="x2" weight="x2">
        You are here!
      </Text>
    </Box>
  );
};

export default NodeTooltipContentCurrent;
