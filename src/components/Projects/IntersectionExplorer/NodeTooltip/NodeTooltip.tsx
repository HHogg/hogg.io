import { Text, Tooltip } from 'preshape';
import { PropsWithChildren } from 'react';
import { Node, Edge } from '../useGraph';
import NodeTooltipContent from './NodeTooltipContent';

interface Props {
  node: Node | Edge;
}

const NodeTooltip = (props: PropsWithChildren<Props>) => {
  const { children, node } = props;

  return (
    <Tooltip
      borderRadius="x2"
      content={
        <Text align="start" maxWidth="20rem">
          <NodeTooltipContent node={node} />
        </Text>
      }
      paddingHorizontal="x4"
      paddingVertical="x4"
      style={{ pointerEvents: 'none' }}
      visible={node.state.isVisible ? undefined : false}
    >
      {children}
    </Tooltip>
  );
};

export default NodeTooltip;
