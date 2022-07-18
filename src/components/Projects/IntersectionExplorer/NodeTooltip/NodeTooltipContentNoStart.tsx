import { Box, Text } from 'preshape';
import React, { FunctionComponent } from 'react';
import NodeValidationBadge from '../Node/NodeBadge';
import { Node, Edge } from '../useGraph';

interface Props {
  node: Node | Edge;
}

const NodeTooltipContentNoStart: FunctionComponent<Props> = (props) => {
  const { node } = props;

  return (
    <Box alignChildrenVertical="middle" flex="vertical">
      <Text size="x3" strong>
        <NodeValidationBadge>Node {node.index}</NodeValidationBadge> has
        traversed all edges.
      </Text>
    </Box>
  );
};

export default NodeTooltipContentNoStart;
