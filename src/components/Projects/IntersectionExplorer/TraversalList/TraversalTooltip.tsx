import { Box, Text, Tooltip } from 'preshape';
import { PropsWithChildren } from 'react';
import NodeBadge from '../Node/NodeBadge';
import { Traversal } from '../useGraph';

interface Props {
  traversal: Traversal;
  visible?: boolean;
}

const TraversalTooltip = (props: PropsWithChildren<Props>) => {
  const { children, traversal, visible } = props;

  const bitsetString = traversal.bitset.toString();
  const bitsetStringPadded = bitsetString
    .padStart(Math.ceil(bitsetString.length / 16) * 16, '0')
    .split('')
    .map((v, i) => (
      <Text
        tag="span"
        key={i}
        textColor={!+v ? 'text-shade-1' : 'negative-shade-4'}
      >
        {v}
      </Text>
    ));

  return (
    <Tooltip
      content={
        <Box maxWidth="10.5rem">
          <Box alignChildren="middle" flex="vertical" margin="x3">
            <NodeBadge>Traversal {traversal.index}</NodeBadge>
          </Box>

          <Box
            backgroundColor="background-shade-3"
            borderRadius="x2"
            paddingHorizontal="x2"
            paddingVertical="x2"
          >
            <Text breakOn="all" monospace size="x2" weight="x2">
              {bitsetStringPadded}
            </Text>
          </Box>
        </Box>
      }
      visible={visible}
    >
      {children}
    </Tooltip>
  );
};

export default TraversalTooltip;
