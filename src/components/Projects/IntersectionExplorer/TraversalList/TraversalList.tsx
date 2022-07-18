import { Labels } from 'preshape';
import React, { useContext } from 'react';
import { IntersectionExplorerContext } from '../IntersectionExplorer';
import { getCompleteTraversals } from '../useGraph/traversal';
import TraversalListItem from './TraversalListItem';

interface Props {
  onTraversalOver: (index: number) => void;
}

const TraversalList: React.FunctionComponent<Props> = ({ onTraversalOver }) => {
  const { traversals } = useContext(IntersectionExplorerContext);
  const completeTraversals = getCompleteTraversals(traversals);

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
