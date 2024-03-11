import { Box, BoxProps, Text, borderRadiusSizeX1Px, sizeX3Px } from 'preshape';
import getSequenceColor from './getSequenceColor';

type Props = {
  isSymmetrical: boolean;
};

export default function SequenceLabel({
  isSymmetrical,
  ...rest
}: Props & BoxProps) {
  return (
    <Box {...rest} alignChildren="start" flex="horizontal">
      <Text
        size="x1"
        weight="x4"
        backgroundColor={getSequenceColor(isSymmetrical)}
        textColor="background-shade-1"
        paddingHorizontal="x2"
        paddingVertical="x1"
        uppercase
        style={{
          borderTopLeftRadius: borderRadiusSizeX1Px,
          borderTopRightRadius: borderRadiusSizeX1Px,
          marginLeft: sizeX3Px,
        }}
      >
        {isSymmetrical ? 'Symmetrical' : 'Asymmetrical'}
      </Text>
    </Box>
  );
}
