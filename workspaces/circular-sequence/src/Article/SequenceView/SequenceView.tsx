import { Box, BoxProps, Text, borderRadiusSizeX1Px } from 'preshape';
import { useMemo } from 'react';
import useWasmApi, { Sequence } from '../WasmApi/useWasmApi';
import SequenceLabel from './SequenceLabel';
import SequenceLength from './SequenceLength';
import SequenceSingle from './SequenceSingle';
import getSequenceColor from './getSequenceColor';

type Props = {
  sequence: Sequence;
};

export default function SequenceView({ sequence, ...rest }: Props & BoxProps) {
  const wasmApi = useWasmApi();
  const sequenceWithoutZeroes = useMemo(
    () => sequence.filter((v) => v !== 0),
    [sequence]
  );

  const { isSymmetrical, length, symmetryIndex } = useMemo(
    () => ({
      isSymmetrical: wasmApi.isSymmetrical(sequence),
      length: wasmApi.getLength(sequence),
      minPermutation: wasmApi.getMinPermutation(sequence),
      symmetryIndex: wasmApi.getSymmetryIndex(sequence),
    }),
    [sequence, wasmApi]
  );

  return (
    <Box {...rest} flex="horizontal" alignChildren="middle">
      <Box>
        <Box flex="horizontal" alignChildrenVertical="end">
          <Box>
            <SequenceLabel isSymmetrical={isSymmetrical} />

            <SequenceSingle
              isSymmetrical={isSymmetrical}
              sequence={sequenceWithoutZeroes}
              symmetryIndex={symmetryIndex}
              style={{
                borderRight: 'none',
                borderTopLeftRadius: borderRadiusSizeX1Px,
                borderBottomLeftRadius: borderRadiusSizeX1Px,
              }}
            />
          </Box>

          <Box>
            <SequenceLength length={length} />

            <SequenceSingle
              isSymmetrical={isSymmetrical}
              offset={length}
              sequence={sequenceWithoutZeroes}
              symmetryIndex={symmetryIndex}
              style={{
                borderLeftStyle: 'dashed',
                borderTopRightRadius: borderRadiusSizeX1Px,
                borderBottomRightRadius: borderRadiusSizeX1Px,
              }}
            />
          </Box>
        </Box>

        {!isSymmetrical && (
          <Text
            align="middle"
            margin="x2"
            textColor={getSequenceColor(isSymmetrical)}
            size="x2"
            weight="x3"
          >
            <Text>{[...sequenceWithoutZeroes].reverse().join(',')}</Text>
            <Text>Reverse not found</Text>
          </Text>
        )}
      </Box>
    </Box>
  );
}
