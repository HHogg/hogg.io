import {
  Placement,
  PlacementArrow,
  PlacementContent,
  PlacementManager,
  PlacementProps,
  PlacementReference,
  PlacementReferenceProps,
} from 'preshape';
import React, { FunctionComponent } from 'react';
import { Node, Edge } from '../useGraph';
import NodeTooltipContentCurrent from './NodeTooltipContentCurrent';
import NodeTooltipContentNext from './NodeTooltipContentNext';
import NodeTooltipContentNoStart from './NodeTooltipContentNoStart';
import NodeTooltipContentPrevious from './NodeTooltipContentPrevious';
import NodeTooltipContentStart from './NodeTooltipContentStart';

interface Props {
  children: PlacementReferenceProps['children'];
  currentNode?: number;
  isTraversing?: boolean;
  node: Node | Edge;
  visible?: boolean;
}

const options: PlacementProps['options'] = {
  modifiers: {
    preventOverflow: {
      boundariesElement: 'window',
    },
  },
 };

const NodeTooltip: FunctionComponent<Props> = (props) => {
  const { children, currentNode, isTraversing, node, visible } = props;

  const TooltipContent = () => {
    if (!isTraversing && node.state.isValid[0] === null) return <NodeTooltipContentNoStart node={ node } />;
    if (!isTraversing && node.state.isValid[0] === true) return <NodeTooltipContentStart node={ node } />;
    if (node.state.isCurrent) return <NodeTooltipContentCurrent node={ node } />;
    if (node.state.isNext) return <NodeTooltipContentNext node={ node } />;
    if (node.state.isPrevious) return <NodeTooltipContentPrevious currentNode={ currentNode } node={ node } />;

    return null;
  };

  return (
    <PlacementManager>
      <PlacementReference>
        { children }
      </PlacementReference>

      <Placement
          animation="Fade"
          options={ options }
          placement="top"
          style={ { pointerEvents: 'none' } }
          unrender
          visible={ visible }>
        <PlacementArrow backgroundColor="text-shade-1" />
        <PlacementContent
            backgroundColor="text-shade-1"
            borderRadius="x2"
            maxWidth="20rem"
            onClick={ (event) => event.stopPropagation() }
            paddingHorizontal="x4"
            paddingVertical="x4"
            style={ { pointerEvents: 'none' } }
            textColor="background-shade-1">
          <TooltipContent />
        </PlacementContent>
      </Placement>
    </PlacementManager>
  );
};

export default NodeTooltip;
