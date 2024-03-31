import { Box, Text } from 'preshape';
import { FunctionComponent } from 'react';
import { Node, Edge } from '@hogg/circle-intersections';
import NodeValidationBadge from '../Node/NodeBadge';

type Props = {
  node: Node | Edge;
};

const NodeTooltipContentNoStart: FunctionComponent<Props> = (props) => {
  const { node } = props;

  return (
    <Box alignChildrenVertical="middle" flex="vertical">
      <Text size="x3" weight="x2">
        <NodeValidationBadge>Node {node.index}</NodeValidationBadge> has
        traversed all edges.
      </Text>
    </Box>
  );
};

export default NodeTooltipContentNoStart;
