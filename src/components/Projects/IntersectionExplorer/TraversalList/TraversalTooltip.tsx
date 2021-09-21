import {
  Box,
  Placement,
  PlacementArrow,
  PlacementContent,
  PlacementManager,
  PlacementProps,
  PlacementReference,
  PlacementReferenceProps,
  Text,
} from 'preshape';
import React, { FunctionComponent } from 'react';
import NodeBadge from '../Node/NodeBadge';
import { Traversal } from '../useGraph';

interface Props {
  children: PlacementReferenceProps['children'];
  traversal: Traversal;
  visible?: boolean;
}

const options: PlacementProps['options'] = {
  modifiers: {
    preventOverflow: {
      boundariesElement: 'window',
    },
  },
 };

const TraversalTooltip: FunctionComponent<Props> = (props) => {
  const { children, traversal, visible } = props;

  const bitsetString = traversal.bitset.toString();
  const bitsetStringPadded = bitsetString
    .padStart(Math.ceil(bitsetString.length / 16) * 16, '0')
    .split('')
    .map((v, i) =>
      <Text
          inline
          key={ i }
          textColor={ !+v ? 'negative-shade-2' : 'positive-shade-2' }>{ v }</Text>);

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
            maxWidth="10.5rem"
            onClick={ (event) => event.stopPropagation() }
            paddingHorizontal="x4"
            paddingVertical="x4"
            style={ { pointerEvents: 'none' } }
            textColor="background-shade-1">
          <Box alignChildren="middle" flex="vertical" margin="x3">
            <NodeBadge>
              Traversal { traversal.index }
            </NodeBadge>
          </Box>

          <Box
              backgroundColor="text-shade-2"
              paddingHorizontal="x2"
              paddingVertical="x2">
            <Text
                breakOn="all"
                monospace
                size="x1"
                strong>
              { bitsetStringPadded }
            </Text>
          </Box>
        </PlacementContent>
      </Placement>
    </PlacementManager>
  );
};

export default TraversalTooltip;
