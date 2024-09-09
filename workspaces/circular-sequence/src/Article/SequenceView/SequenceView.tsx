import { useWasmApi } from '@hogg/wasm';
import { Box, BoxProps, Text, borderRadiusSizeX1Px } from 'preshape';
import { useEffect, useMemo, useState } from 'react';
import { Sequence } from '../../types';
import SequenceLabel from './SequenceLabel';
import SequenceLength from './SequenceLength';
import SequenceSingle from './SequenceSingle';
import getSequenceColor from './getSequenceColor';

type Props = {
  sequence: Sequence;
};

type SequenceInfo = {
  isSymmetrical: boolean;
  length: number;
  minPermutation: Sequence | null;
  symmetryIndex: number;
};

export default function SequenceView({ sequence, ...rest }: Props & BoxProps) {
  const { api } = useWasmApi();
  const sequenceWithoutZeroes = useMemo(
    () => sequence.filter((v) => v !== 0),
    [sequence]
  );

  const [{ isSymmetrical, length, symmetryIndex }, setSequenceInfo] =
    useState<SequenceInfo>(() => ({
      isSymmetrical: false,
      length: 0,
      minPermutation: null,
      symmetryIndex: 0,
    }));

  useEffect(() => {
    Promise.all([
      api.isSequenceSymmetrical([sequence]),
      api.getSequenceLength([sequence]),
      api.getSequenceMinPermutation([sequence]),
      api.getSequenceSymmetryIndex([sequence]),
    ]).then(([isSymmetrical, length, minPermutation, symmetryIndex = 0]) => {
      setSequenceInfo({
        isSymmetrical,
        length,
        minPermutation,
        symmetryIndex,
      });
    });
  }, [sequence, api]);

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

        {isSymmetrical && (
          <Text
            align="middle"
            margin="x2"
            textColor={getSequenceColor(isSymmetrical)}
            size="x2"
            weight="x3"
          >
            Reverse found ({[...sequenceWithoutZeroes].reverse().join(',')})
          </Text>
        )}

        {!isSymmetrical && (
          <Text
            align="middle"
            margin="x2"
            textColor={getSequenceColor(isSymmetrical)}
            size="x2"
            weight="x3"
          >
            Reverse not found ({[...sequenceWithoutZeroes].reverse().join(',')})
          </Text>
        )}
      </Box>
    </Box>
  );
}
