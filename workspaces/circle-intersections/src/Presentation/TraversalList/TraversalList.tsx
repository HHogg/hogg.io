import { RouteIcon } from 'lucide-react';
import { Box, Text } from 'preshape';
import { getCompleteTraversals } from '../../useGraph';
import TraversalHistory from '../TraversalHistory/TraversalHistory';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';
import TraversalListItem from './TraversalListItem';

const TraversalList = () => {
  const { graph, currentTraversal } = useIntersectionExplorerContext();
  const completeTraversals = getCompleteTraversals(graph.traversals);

  if (!completeTraversals.length) {
    if (currentTraversal) {
      return (
        <Box alignChildren="middle" flex="vertical" paddingVertical="x8">
          <TraversalHistory traversal={currentTraversal} />
        </Box>
      );
    }

    return (
      <Box
        alignChildren="middle"
        flex="vertical"
        gap="x4"
        textColor="text-shade-4"
        paddingVertical="x8"
      >
        <RouteIcon size="3rem" />

        <Box alignChildren="middle" flex="vertical" gap="x1">
          <Text size="x5" weight="x2">
            No traversals recorded
          </Text>
          <Text size="x3">
            Click on nodes on the graph above to get started.
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex="vertical" gap="x2" wrap>
      {completeTraversals.reverse().map((traversal) => (
        <TraversalListItem
          key={traversal.bitset.toString()}
          traversal={traversal}
        />
      ))}
    </Box>
  );
};

export default TraversalList;
