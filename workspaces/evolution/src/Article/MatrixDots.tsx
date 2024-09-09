import { Box, Text, TextProps } from 'preshape';

type Props = {
  h?: boolean;
  d?: boolean;
  v?: boolean;
};

export default function MatrixDots({ h, d, v }: Props) {
  let props: TextProps = {};

  if (h) {
    props = { flex: 'horizontal', alignChildrenVertical: 'middle' };
  }

  if (d) {
    props = { flex: 'vertical' };
  }

  if (v) {
    props = { flex: 'vertical', alignChildrenHorizontal: 'middle' };
  }

  return (
    <Text gap="x1" grow {...props}>
      <Text flex="horizontal" alignChildrenHorizontal="start">
        <Box
          width="2px"
          height="2px"
          backgroundColor="text-shade-1"
          borderRadius="50%"
        />
      </Text>

      <Text flex="horizontal" alignChildrenHorizontal="middle">
        <Box
          width="2px"
          height="2px"
          backgroundColor="text-shade-1"
          borderRadius="50%"
        />
      </Text>

      <Text flex="horizontal" alignChildrenHorizontal="end">
        <Box
          width="2px"
          height="2px"
          backgroundColor="text-shade-1"
          borderRadius="50%"
        />
      </Text>
    </Text>
  );
}
