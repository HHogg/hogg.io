import { Box, Text } from 'preshape';
import { FunctionComponent } from 'react';
import NodeValidationBadge from '../Node/NodeBadge';
import { Node, Edge } from '../useGraph';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';

interface Props {
  node: Node | Edge;
}

const NodeTooltipContentCurrent: FunctionComponent<Props> = (props) => {
  const { node } = props;
  const { currentTraversalNode } = useIntersectionExplorerContext();

  return (
    <Box alignChildren="middle" flex="vertical">
      <Text margin="x2" size="x2" weight="x2">
        <NodeValidationBadge>Node {node.index}</NodeValidationBadge> is not
        connected to{' '}
        <NodeValidationBadge>Node {currentTraversalNode}</NodeValidationBadge>
      </Text>
    </Box>
  );
};

export default NodeTooltipContentCurrent;
