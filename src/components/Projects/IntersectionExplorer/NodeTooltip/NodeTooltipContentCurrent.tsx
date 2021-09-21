import { Box, Text } from 'preshape';
import React, { FunctionComponent } from 'react';
import NodeValidationBadge from '../Node/NodeBadge';
import { Node, Edge } from '../useGraph';

interface Props {
  node: Node | Edge;
}

const NodeTooltipContentCurrent: FunctionComponent<Props> = (props) => {
  const { node } = props;

  return (
    <Box alignChildren="middle" flex="vertical">
      <NodeValidationBadge>Node { node.index }</NodeValidationBadge>
      <Text margin="x2" size="x1" strong>You are here!</Text>
    </Box>
  );
};

export default NodeTooltipContentCurrent;
