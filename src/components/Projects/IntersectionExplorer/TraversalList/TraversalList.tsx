import { Labels, Text } from 'preshape';
import React, { FunctionComponent, useContext } from 'react';
import { IntersectionExplorerContext } from '../IntersectionExplorer';
import { getCompleteTraversals } from '../useGraph/traversal';
import TraversalListItem from './TraversalListItem';

interface Props {
  onTraversalOver: (index: number) => void;
}

const TraversalList: FunctionComponent<Props> = ({ onTraversalOver }) => {
  const { graph } = useContext(IntersectionExplorerContext);
  const completeTraversals = getCompleteTraversals(graph.traversals);

  if (completeTraversals.length === 0) {
    return <Text>No traversals added</Text>;
  }

  return (
    <Labels flex="horizontal" margin="x6" style={{ gap: 8 }} wrap>
      {completeTraversals.map((traversal) => (
        <TraversalListItem
          key={traversal.bitset.toString()}
          onPointerOver={() => onTraversalOver(traversal.index)}
          traversal={traversal}
        />
      ))}
    </Labels>
  );
};

export default TraversalList;
