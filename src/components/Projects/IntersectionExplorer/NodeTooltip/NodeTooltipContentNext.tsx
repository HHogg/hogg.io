import { Box, Icon, Text } from 'preshape';
import React, { FunctionComponent } from 'react';
import NodeValidationMessage from '../NodeValidation/NodeValidationMessage';
import { Node, Edge } from '../useGraph';

interface Props {
  node: Node | Edge;
}

const NodeTooltipContentNext: FunctionComponent<Props> = (props) => {
  const { node } = props;
  const { isValid: [, ...validations] } = node.state;

  return (
    <Box
        borderRadius="x2"
        flex="vertical"
        gap="x1"
        margin="x6"
        overflow="hidden">
      { validations.map((validation) => (
        <Box
            alignChildrenVertical="middle"
            backgroundColor="text-shade-2"
            flex="horizontal"
            gap="x4"
            key={ validation.number }
            margin="x4"
            paddingHorizontal="x4"
            paddingVertical="x2">
          <Box
              backgroundColor={
                (validation.isValid === false && 'negative-shade-2') ||
                (validation.isValid === true && 'positive-shade-2') ||
                'text-shade-3' }
              borderRadius="full"
              padding="x1">
            <Icon name="Cross" size="1rem" />
          </Box>

          <Box shrink>
            <Text
                size="x1"
                strong>
              <NodeValidationMessage validation={ validation } />
            </Text>
          </Box>
        </Box>
      )) }
    </Box>
  );
};

export default NodeTooltipContentNext;
