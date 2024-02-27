import { Box, BoxProps } from 'preshape';

type Props = Omit<BoxProps, 'size'> & {
  align?: BoxProps['alignChildrenHorizontal'];
  count: number;
  size?: number | ((index: number) => number);
};

export default function Lines({
  align,
  backgroundColor = 'text-shade-1',
  count,
  gap = 'x2',
  flex = 'vertical',
  size = 10,
  ...rest
}: Props) {
  return (
    <Box
      {...rest}
      alignChildrenHorizontal={align}
      container
      flex={flex}
      gap={gap}
      overflow="hidden"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          borderRadius="x2"
          backgroundColor={backgroundColor}
          height={
            flex === 'vertical'
              ? typeof size === 'function'
                ? size(i)
                : size
              : undefined
          }
          width={
            flex === 'horizontal'
              ? typeof size === 'function'
                ? size(i)
                : size
              : undefined
          }
          key={i}
        />
      ))}
    </Box>
  );
}
