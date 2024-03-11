import { Box, BoxProps, Text } from 'preshape';
import getSequenceColor from './getSequenceColor';

type Props = {
  isSymmetrical: boolean;
  offset?: number;
  sequence: number[];
  symmetryIndex?: number;
};

export default function SequenceSingle({
  isSymmetrical,
  offset = 0,
  sequence,
  symmetryIndex,
  ...rest
}: Props & BoxProps) {
  const isSymmetryCell = (index: number) => {
    if (symmetryIndex === undefined) {
      return false;
    }

    return (
      index + offset >= symmetryIndex &&
      index + offset < symmetryIndex + sequence.length
    );
  };

  return (
    <Box
      {...rest}
      flex="horizontal"
      borderSize="x2"
      borderColor={getSequenceColor(isSymmetrical)}
    >
      {sequence
        .filter((v) => v !== 0)
        .map((value, index) => (
          <Box
            key={index}
            padding="x3"
            borderLeft={index > 0}
            borderSize={index > 0 ? 'x2' : undefined}
            borderStyle={index === sequence.length ? 'dashed' : undefined}
            borderColor={
              (index === symmetryIndex && getSequenceColor(isSymmetrical, 3)) ||
              (isSymmetryCell(index) && getSequenceColor(isSymmetrical, 2)) ||
              'background-shade-4'
            }
            backgroundColor={
              isSymmetryCell(index)
                ? getSequenceColor(isSymmetrical, 1)
                : undefined
            }
          >
            <Text
              size="x5"
              weight="x3"
              textColor={
                isSymmetryCell(index)
                  ? getSequenceColor(isSymmetrical, 3)
                  : undefined
              }
            >
              {value}
            </Text>
          </Box>
        ))}
    </Box>
  );
}
