import { Box, Text } from 'preshape';
import React, { FunctionComponent } from 'react';
import NodeValidationBadge from '../Node/NodeBadge';
import { Node, Edge } from '../useGraph';

interface Props {
  node: Node | Edge;
}

const NodeTooltipContentStart: FunctionComponent<Props> = (props) => {
  const { node } = props;

  return (
    <Box alignChildrenVertical="middle" flex="vertical">
      <Text size="x2" strong>Start at <NodeValidationBadge>Node { node.index }</NodeValidationBadge></Text>
    </Box>
  );
};

export default NodeTooltipContentStart;
