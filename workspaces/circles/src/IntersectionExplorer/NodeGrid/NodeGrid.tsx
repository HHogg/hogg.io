import { LayoutGroup, motion } from 'framer-motion';
import { Grid } from 'preshape';
import { Graph, Traversal } from '../../useGraph';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';
import NodeGridItem from './NodeGridItem';

const getSortedNodes = (graph: Graph, traversal: Traversal | null) => {
  return [...graph.nodes, ...graph.edges]
    .filter(({ isEdge, state }) => (traversal ? state.isNext : !isEdge))
    .sort((a, b) => {
      // Send previously traversed nodes to the top.
      if (traversal) {
        // Sort by their location in the path.
        if (a.state.isPrevious && b.state.isPrevious) {
          return (
            traversal.path.indexOf(a.index) - traversal.path.indexOf(b.index)
          );
        }

        if (a.state.isPrevious !== b.state.isPrevious) {
          if (a.state.isPrevious) return -1;
          if (b.state.isPrevious) return 1;
        }
      }

      if (a.state.isNext !== b.state.isNext) {
        if (a.state.isNext) return 1;
        if (b.state.isNext) return -1;
      }

      return a.index - b.index;
    });
};

const NodeGrid = () => {
  const { activeNodeIndex, currentTraversal, graph } =
    useIntersectionExplorerContext();

  return (
    <LayoutGroup>
      <Grid repeatWidthMin="100px" flex="vertical" gap="x3">
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
            style={{
              filter:
                activeNodeIndex === -1 || activeNodeIndex === node.index
                  ? undefined
                  : 'grayscale(1)',
            }}
            transition={{
              delay: 10 / 1000,
            }}
          >
            <NodeGridItem node={node} />
          </motion.div>
        ))}
      </Grid>
    </LayoutGroup>
  );
};

export default NodeGrid;
