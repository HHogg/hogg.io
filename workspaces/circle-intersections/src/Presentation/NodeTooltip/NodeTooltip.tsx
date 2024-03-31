import { Text, Tooltip } from 'preshape';
import { PropsWithChildren } from 'react';
import { Node, Edge } from '@hogg/circle-intersections';
import NodeTooltipContent from './NodeTooltipContent';

type Props = {
  node: Node | Edge;
};

const NodeTooltip = (props: PropsWithChildren<Props>) => {
  const { children, node } = props;

  if (!node.state.isSelectable) {
    return children;
  }

  return (
    <Tooltip
      animation="Fade"
      borderRadius="x2"
      content={
        <Text align="start" maxWidth="20rem">
          <NodeTooltipContent node={node} />
        </Text>
      }
      paddingHorizontal="x4"
      paddingVertical="x4"
      style={{ pointerEvents: 'none' }}
    >
      {children}
    </Tooltip>
  );
};

export default NodeTooltip;
