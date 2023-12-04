import { Box, BoxProps, Text } from 'preshape';
import Lines from '../../components/Lines/Lines';

type Props = BoxProps & {
  maxWidthTop?: number;
  maxWidthBottom?: number;
  title: string;
};

export default function SectionTitle({
  maxWidthTop,
  maxWidthBottom,
  title,
  ...rest
}: Props) {
  return (
    <Box {...rest} flex="vertical" gap="x1">
      <Lines count={2} size={4} gap="x1" style={{ maxWidth: maxWidthTop }} />

      <Box alignChildrenVertical="middle" flex="horizontal" gap="x2">
        <Lines count={4} size={4} gap="x1" width="32px" />

        <Text
          backgroundColor="background-shade-1"
          borderRadius="x1"
          paddingVertical="x1"
          paddingHorizontal="x1"
          monospace
          uppercase
          size="x3"
          textColor="text-shade-1"
          weight="x5"
        >
          {title}
        </Text>

        <Lines count={4} grow size={4} gap="x1" />
      </Box>

      <Lines count={1} size={8} gap="x1" style={{ maxWidth: maxWidthBottom }} />
    </Box>
  );
}
