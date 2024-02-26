import { Box, Text, Tooltip } from 'preshape';
import { PropsWithChildren } from 'react';
import { Traversal } from '../../useGraph';

type Props = {
  traversal: Traversal;
  visible?: boolean;
};

const BitSetTooltip = (props: PropsWithChildren<Props>) => {
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
        <Box maxWidth="120px">
          <Text breakOn="all" monospace size="x2">
            {bitsetStringPadded}
          </Text>
        </Box>
      }
      visible={visible}
    >
      {children}
    </Tooltip>
  );
};

export default BitSetTooltip;
