import { BinaryIcon, Trash2Icon } from 'lucide-react';
import { Box, Button, Buttons, Motion } from 'preshape';
import { FunctionComponent, PointerEvent } from 'react';
import { Traversal } from '../../useGraph';
import TraversalHistory from '../TraversalHistory/TraversalHistory';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';
import BitSetTooltip from './BitSetTooltip';

type Props = {
  traversal: Traversal;
};

const TraversalListItem: FunctionComponent<Props> = ({ traversal }) => {
  const { bitset, index } = traversal;
  const {
    activeNodeIndex,
    activeTraversalIndex,
    removeTraversal,
    setActiveTraversalIndex,
  } = useIntersectionExplorerContext();
  const isTraversalActive =
    activeTraversalIndex === index || bitset.get(activeNodeIndex) === 1;

  const isFocused =
    (activeNodeIndex === -1 && activeTraversalIndex === -1) ||
    isTraversalActive;

  const handlePointerOver = (event: PointerEvent) => {
    event.stopPropagation();
    setActiveTraversalIndex(index);
  };

  return (
    <Motion
      alignChildrenVertical="middle"
      borderBottom={traversal.index > 0}
      borderColor="background-shade-4"
      flex="horizontal"
      gap="x6"
      paddingVertical="x2"
      onPointerOver={handlePointerOver}
      animate={{
        opacity: isFocused ? 1 : 0.25,
      }}
      initial={{
        opacity: 0,
      }}
    >
      <Box basis="0" grow>
        <TraversalHistory traversal={traversal} />
      </Box>

      <Box>
        <Buttons alignChildren="middle">
          <BitSetTooltip traversal={traversal}>
            <BinaryIcon size="1.5rem" />
          </BitSetTooltip>

          <Button
            color="negative"
            padding="x2"
            variant="tertiary"
            onClick={() => removeTraversal(traversal.index)}
          >
            <Trash2Icon size="1.25rem" />
          </Button>
        </Buttons>
      </Box>
    </Motion>
  );
};

export default TraversalListItem;
