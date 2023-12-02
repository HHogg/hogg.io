import { LayoutGroup, motion } from 'framer-motion';
import { Box, Button, Grid } from 'preshape';
import { PointerEvent } from 'react';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';
import NodeListItem from './NodeListItem';
import getSortedNodes from './getSortedNodes';
import './NodeList.css';

const NodeList = () => {
  const {
    activeNodeIndex,
    cancelTraversal,
    currentTraversal,
    graph,
    setActiveNodeIndex,
  } = useIntersectionExplorerContext();

  const handlePointerOver = (index: number) => (event: PointerEvent) => {
    event.stopPropagation();
    setActiveNodeIndex(index);
  };

  return (
    <Box theme="night">
      <LayoutGroup>
        <motion.div className="NodeList" layout>
          <Grid gap="x1" repeat={6} repeatWidthMin="0px">
            {getSortedNodes(graph, currentTraversal).map((node) => (
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
                <NodeListItem node={node} />
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
      </LayoutGroup>
    </Box>
  );
};

export default NodeList;
