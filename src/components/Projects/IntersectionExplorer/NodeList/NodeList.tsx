import { AnimateSharedLayout, motion } from 'framer-motion';
import { Box, Button, Grid } from 'preshape';
import React, { useContext } from 'react';
import { IntersectionExplorerContext } from '../IntersectionExplorer';
import { getCurrentTraversal } from '../useGraph/traversal';
import getSortedNodes from './getSortedNodes';
import NodeListItem from './NodeListItem';
import './NodeList.css';

interface Props {
  onNodeOver: (index: number) => void;
}

const NodeList = ({ onNodeOver }: Props) => {
  const {
    activeNodeIndex,
    addToTraversal,
    cancelTraversal,
    graph,
    traversals,
  } = useContext(IntersectionExplorerContext);
  const currentTraversal = getCurrentTraversal(traversals);
  const currentTraversalNode =
    currentTraversal?.path[currentTraversal.path.length - 1];
  const nodesSorted = getSortedNodes(graph, currentTraversal);

  const handleNodeClick = (index: number) => {
    addToTraversal(index);
    onNodeOver(-1);
  };

  const handlePointerOver = (index: number) => (event: React.PointerEvent) => {
    event.stopPropagation();
    onNodeOver(index);
  };

  return (
    <Box>
      <AnimateSharedLayout>
        <motion.div className="NodeList" layout="position">
          <Grid gap="x1" repeat={6} repeatWidthMin="0px">
            {nodesSorted.map((node) => (
              <motion.div
                animate={{
                  opacity:
                    activeNodeIndex === -1 || activeNodeIndex === node.index
                      ? 1
                      : 0.25,
                  scale:
                    activeNodeIndex === -1 || activeNodeIndex === node.index
                      ? 1
                      : 0.95,
                }}
                initial={{
                  opacity: 0,
                  scale: 1,
                }}
                key={node.index}
                layout
                onPointerOver={handlePointerOver(node.index)}
                style={{
                  gridColumn:
                    (currentTraversal && node.state.isVisible && 'span 6') ||
                    'span 2',
                  filter:
                    activeNodeIndex === -1 || activeNodeIndex === node.index
                      ? undefined
                      : 'grayscale(1)',
                }}
                transition={{
                  delay: 10 / 1000,
                }}
              >
                <NodeListItem
                  currentNode={currentTraversalNode}
                  isFocused={activeNodeIndex === node.index}
                  isTraversing={!!currentTraversal}
                  node={node}
                  onClick={
                    node.state.isSelectable
                      ? () => handleNodeClick(node.index)
                      : undefined
                  }
                />
              </motion.div>
            ))}

            <motion.div
              animate={{
                opacity: currentTraversal
                  ? activeNodeIndex === -1
                    ? 1
                    : 0.25
                  : 0,
                scale: activeNodeIndex === -1 ? 1 : 0.95,
              }}
              initial={{
                opacity: 0,
                scale: 1,
              }}
              layout
              style={{
                gridColumn: 'span 6',
                paddingLeft: 8 * 4,
                filter: activeNodeIndex === -1 ? undefined : 'grayscale(1)',
              }}
              transition={{
                delay: 10 / 1000,
              }}
            >
              <Button
                borderRadius="x2"
                color="negative"
                onClick={cancelTraversal}
                width="100%"
              >
                Cancel Traversal
              </Button>
            </motion.div>
          </Grid>
        </motion.div>
      </AnimateSharedLayout>
    </Box>
  );
};

export default NodeList;
