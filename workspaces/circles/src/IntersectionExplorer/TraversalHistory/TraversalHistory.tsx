import { LayoutGroup } from 'framer-motion';
import { Box, Motion, Tooltip } from 'preshape';
import { Traversal } from '../../useGraph';
import NodeBadge from '../Node/NodeBadge';
import NodeIcon from '../Node/NodeIcon';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';

type Props = {
  traversal: Traversal;
};

export default function TraversalHistory({ traversal }: Props) {
  const { graph } = useIntersectionExplorerContext();
  const nodes = traversal.path.map(
    (nodeIndex) => [...graph.nodes, ...graph.edges][nodeIndex]
  );

  if (nodes.length === 0) {
    return null;
  }

  if (traversal.isComplete) {
    nodes.pop();
  }

  const firstNode = nodes[0];
  const lastNode = nodes.length > 1 ? nodes[nodes.length - 1] : undefined;

  return (
    <Box alignChildrenVertical="middle" flex="horizontal" gap="x4">
      {firstNode && (
        <NodeBadge>
          {firstNode.isNode ? 'Node' : 'Edge'} {firstNode.index}
        </NodeBadge>
      )}

      <Box
        alignChildrenVertical="middle"
        container
        flex="horizontal"
        gap="x4"
        wrap
      >
        <Box absolute="left" style={{ margin: '0 4px', right: 0 }}>
          <Motion borderBottom borderSize="x2" layout />
        </Box>

        <LayoutGroup>
          {nodes.map((node, index, { length }) => (
            <Motion
              alignChildren="middle"
              animate={{ opacity: 1 }}
              container
              flex={length > 1 ? 'horizontal' : 'vertical'}
              gap="x4"
              initial={{ opacity: 0 }}
              layout="position"
              key={node.index}
            >
              <Tooltip
                content={`${node.isNode ? 'Node' : 'Edge'} ${node.index}`}
                trigger="hover"
                visible={index > 0 && index < length - 1 ? undefined : false}
              >
                <NodeIcon
                  node={node}
                  connectionLineLength={index > 0 ? -24 : 0}
                />
              </Tooltip>
            </Motion>
          ))}
        </LayoutGroup>
      </Box>

      {lastNode && (
        <NodeBadge>
          {lastNode.isNode ? 'Node' : 'Edge'} {lastNode.index}
        </NodeBadge>
      )}
    </Box>
  );
}
