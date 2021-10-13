import classNames from 'classnames';
import { Box } from 'preshape';
import React from 'react';
import NodeValidationBadge from '../Node/NodeBadge';
import NodeIcon from '../Node/NodeIcon';
import NodeTooltip from '../NodeTooltip/NodeTooltip';
import NodeValidation from '../NodeValidation/NodeValidation';
import { Edge, Node } from '../useGraph';

interface Props {
  currentNode?: number;
  isFocused?: boolean;
  isTraversing?: boolean;
  onClick?: () => void;
  node: Edge | Node;
}

const NodeListItem = ({ currentNode, isFocused, isTraversing, onClick, node }: Props) => {
  const { isNode } = node;
  const {
    isPrevious,
    isNext,
    isSelectable,
  } = node.state;

  const classes = classNames('NodeList__item', {
    'NodeList__item--next': isTraversing && isNext && !isPrevious,
  });

  return (
    <NodeTooltip
        currentNode={ currentNode }
        isTraversing={ isTraversing }
        node={ node }
        visible={ isFocused }>
      { (props) => (
        <Box { ...props }
            alignChildrenVertical="middle"
            borderRadius="x1"
            className={ classes }
            clickable={ isSelectable }
            flex="horizontal"
            onClick={ onClick }
            padding="x3">
          <Box
              alignChildrenVertical="middle"
              flex="horizontal"
              gap="x3"
              grow>
            <Box>
              <NodeIcon { ...node.state }
                  isFocused={ isFocused }
                  isTraversing={ isTraversing }
                  n={ node.index } />
            </Box>

            <Box>
              <NodeValidationBadge>
                { isTraversing && (isNode ? 'Node' : 'Edge') } { node.index }
              </NodeValidationBadge>
            </Box>
          </Box>

          { isTraversing && (
            <Box>
              <NodeValidation node={ node } />
            </Box>
          ) }
        </Box>
      ) }
    </NodeTooltip>
  );
};

export default NodeListItem;
