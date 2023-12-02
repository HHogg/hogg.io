import { Labels, Text } from 'preshape';
import { getCompleteTraversals } from '../useGraph/traversal';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';
import TraversalListItem from './TraversalListItem';

const TraversalList = () => {
  const { graph } = useIntersectionExplorerContext();
  const completeTraversals = getCompleteTraversals(graph.traversals);

  if (completeTraversals.length === 0) {
    return <Text>No traversals added</Text>;
  }

  return (
    <Labels flex="horizontal" style={{ gap: 8 }} wrap>
      {completeTraversals.map((traversal) => (
        <TraversalListItem
          key={traversal.bitset.toString()}
          traversal={traversal}
        />
      ))}
    </Labels>
  );
};

export default TraversalList;
