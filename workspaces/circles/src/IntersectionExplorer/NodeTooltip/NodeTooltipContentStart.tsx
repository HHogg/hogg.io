import { Box, Text } from 'preshape';
import { FunctionComponent } from 'react';
import { Node, Edge } from '../../useGraph';
import NodeValidationBadge from '../Node/NodeBadge';

type Props = {
  node: Node | Edge;
};

const NodeTooltipContentStart: FunctionComponent<Props> = (props) => {
  const { node } = props;

  return (
    <Box alignChildrenVertical="middle" flex="vertical">
      <Text size="x3" weight="x2">
        Start at <NodeValidationBadge>Node {node.index}</NodeValidationBadge>
      </Text>
    </Box>
  );
};

export default NodeTooltipContentStart;
