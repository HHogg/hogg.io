import { PatternBackground } from '@hogg/common';
import { Box, Text } from 'preshape';
import TilingRenderer, { TilingRendererProps } from '../../TilingRenderer';

export type ArrangementCardProps = Omit<TilingRendererProps, 'notation'> & {
  label: string;
  footer?: JSX.Element;
  notation: string;
} & {
  size?: number;
};

export default function ArrangementCard({
  label,
  footer,
  padding = 'x2',
  notation,
  size,
  ...rest
}: ArrangementCardProps) {
  return (
    <Box flex="vertical" gap="x2" grow>
      <Text align="middle" size="x3" weight="x2">
        {label}
      </Text>

      <Box flex="vertical" grow height={size} width={size}>
        <PatternBackground
          alignChildren="middle"
          flex="vertical"
          gap={padding}
          grow
          padding={padding}
          backgroundColor="background-shade-2"
          borderRadius="x2"
          borderSize="x1"
          borderColor="background-shade-4"
          width="100%"
        >
          <TilingRenderer {...rest} notation={notation} />

          {footer && (
            <Text align="middle" size="x2" weight="x2">
              {footer}
            </Text>
          )}
        </PatternBackground>
      </Box>
    </Box>
  );
}
