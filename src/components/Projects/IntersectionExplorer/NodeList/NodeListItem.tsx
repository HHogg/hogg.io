import classNames from 'classnames';
import { Box } from 'preshape';
import NodeValidationBadge from '../Node/NodeBadge';
import NodeIcon from '../Node/NodeIcon';
import NodeTooltip from '../NodeTooltip/NodeTooltip';
import NodeValidation from '../NodeValidation/NodeValidation';
import { Edge, Node } from '../useGraph';
import useIntersectionExplorerContext from '../useIntersectionExplorerContext';

interface Props {
  node: Edge | Node;
}

const NodeListItem = ({ node }: Props) => {
  const { isNode, index, state } = node;
  const { isPrevious, isNext, isSelectable } = state;
  const { isTraversing, addToTraversal, setActiveNodeIndex } =
    useIntersectionExplorerContext();

  const handleClick = () => {
    addToTraversal(index);
    setActiveNodeIndex(-1);
  };

  const classes = classNames('NodeList__item', {
    'NodeList__item--next': isTraversing && isNext && !isPrevious,
  });

  return (
    <NodeTooltip node={node}>
      <Box
        alignChildrenVertical="middle"
        borderRadius="x1"
        className={classes}
        clickable={isSelectable}
        flex="horizontal"
        onClick={isSelectable ? handleClick : undefined}
        padding="x3"
      >
        <Box alignChildrenVertical="middle" flex="horizontal" gap="x3" grow>
          <Box>
            <NodeIcon node={node} />
          </Box>

          <Box>
            <NodeValidationBadge>
              {isTraversing && (isNode ? 'Node' : 'Edge')} {node.index}
            </NodeValidationBadge>
          </Box>
        </Box>

        {isTraversing && (
          <Box>
            <NodeValidation node={node} />
          </Box>
        )}
      </Box>
    </NodeTooltip>
  );
};

export default NodeListItem;
