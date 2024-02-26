import { Node, Edge } from '@hogg/circle-intersections';
import { CheckIcon, XIcon } from 'lucide-react';
import { Box, Text } from 'preshape';
import { FunctionComponent } from 'react';
import NodeValidationMessage from './NodeValidationMessage';

type Props = {
  node: Node | Edge;
};

const NodeTooltipContentNext: FunctionComponent<Props> = (props) => {
  const { node } = props;
  const {
    isValid: [, ...validations],
  } = node.state;

  return (
    <Box
      borderRadius="x2"
      flex="vertical"
      gap="x1"
      margin="x6"
      overflow="hidden"
    >
      {validations.map((validation) => (
        <Box
          alignChildrenVertical="middle"
          backgroundColor="background-shade-4"
          flex="horizontal"
          gap="x4"
          key={validation.number}
          paddingHorizontal="x4"
          paddingVertical="x2"
        >
          <Box
            backgroundColor={
              (validation.isValid === false && 'negative-shade-4') ||
              (validation.isValid === true && 'positive-shade-4') ||
              'text-shade-3'
            }
            borderRadius="full"
            padding="x1"
          >
            {validation.isValid === false ? (
              <XIcon size="1rem" />
            ) : (
              <CheckIcon size="1rem" />
            )}
          </Box>

          <Box shrink>
            <Text size="x2" weight="x2">
              <NodeValidationMessage validation={validation} />
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default NodeTooltipContentNext;
