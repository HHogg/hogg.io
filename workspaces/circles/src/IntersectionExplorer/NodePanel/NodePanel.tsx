import { Box } from 'preshape';
import NodeGrid from '../NodeGrid/NodeGrid';
import TraversalHistory from '../TraversalHistory/TraversalHistory';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';

export default function NodePanel() {
  const { currentTraversal } = useIntersectionExplorerContext();

  return (
    <Box flex="vertical" gap="x6">
      {currentTraversal && (
        <Box alignChildren="middle" flex="horizontal">
          <TraversalHistory traversal={currentTraversal} />
        </Box>
      )}
      <NodeGrid />
    </Box>
  );
}
