import { Box, Text } from 'preshape';
import React, { FunctionComponent } from 'react';
import NodeValidationBadge from '../Node/NodeBadge';
import { Node, Edge } from '../useGraph';

interface Props {
  currentNode?: number;
  node: Node | Edge;
}

const NodeTooltipContentCurrent: FunctionComponent<Props> = (props) => {
  const { currentNode, node } = props;

  return (
    <Box alignChildren="middle" flex="vertical">
      <Text margin="x2" size="x2" strong>
        <NodeValidationBadge>Node {node.index}</NodeValidationBadge> is not
        connected to{' '}
        <NodeValidationBadge>Node {currentNode}</NodeValidationBadge>
      </Text>
    </Box>
  );
};

export default NodeTooltipContentCurrent;
