import classNames from 'classnames';
import { Box, Button, Text, TypeColor } from 'preshape';
import { PointerEvent } from 'react';
import { Edge, Node } from '../../useGraph';
import NodeIcon from '../Node/NodeIcon';
import NodeTooltip from '../NodeTooltip/NodeTooltip';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';

type Props = {
  node: Edge | Node;
};

export default function NodeGridItem({ node }: Props) {
  const { isNode, index, state } = node;
  const { isPrevious, isNext, isSelectable } = state;
  const { activeNodeIndex, isTraversing, addToTraversal, setActiveNodeIndex } =
    useIntersectionExplorerContext();
  const isActive = activeNodeIndex === index;

  const handleClick = () => {
    addToTraversal(index);
    setActiveNodeIndex(-1);
  };

  const handlePointerOver = (event: PointerEvent) => {
    event.stopPropagation();
    setActiveNodeIndex(index);
  };

  const classes = classNames('NodeList__item', {
    'NodeList__item--next': isTraversing && isNext && !isPrevious,
  });

  const color: TypeColor | undefined =
    (state.isPrevious && 'highlight') ||
    (state.isValid[0] === true && 'positive-shade-4') ||
    (state.isValid[0] === false && 'negative-shade-4') ||
    undefined;

  return (
    <NodeTooltip node={node}>
      <Button
        active={isActive}
        alignChildrenVertical="middle"
        backgroundColor="background-shade-1"
        backgroundColorActive="background-shade-1"
        borderRadius="x3"
        borderSize="x1"
        borderColor="background-shade-4"
        borderColorActive={color}
        className={classes}
        clickable={isSelectable}
        flex="vertical"
        gap="x3"
        onClick={isSelectable ? handleClick : undefined}
        onPointerOver={handlePointerOver}
        padding="x2"
        width="100%"
        textColor="text-shade-1"
        textColorHover="text-shade-1"
        textColorActive="text-shade-1"
        theme="night"
      >
        <Box alignChildren="middle" flex="vertical" gap="x2" grow>
          <Box>
            <NodeIcon node={node} size={16} />
          </Box>

          <Box>
            <Text size="x2" weight="x2">
              {isNode ? 'Node' : 'Edge'} {node.index}
            </Text>
          </Box>
        </Box>
      </Button>
    </NodeTooltip>
  );
}
