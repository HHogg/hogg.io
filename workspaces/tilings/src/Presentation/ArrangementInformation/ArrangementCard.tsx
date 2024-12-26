import { PatternBackground } from '@hogg/common';
import { Box, Text } from 'preshape';
import TilingRenderer, { TilingRendererProps } from '../../TilingRenderer';

export type ArrangementCardProps = Omit<TilingRendererProps, 'notation'> & {
  label: string;
  notation: string;
} & {
  size?: number;
};

export default function ArrangementCard({
  label,
  notation,
  size = 80,
  ...rest
}: ArrangementCardProps) {
  return (
    <Box flex="vertical" alignChildren="middle" gap="x2">
      <Box flex="vertical" grow height={size} width={size}>
        <PatternBackground
          alignChildren="middle"
          flex="vertical"
          grow
          padding="x2"
          backgroundColor="background-shade-2"
          borderRadius="x2"
          borderSize="x1"
          borderColor="background-shade-4"
          width="100%"
        >
          <TilingRenderer {...rest} notation={notation} />
        </PatternBackground>
      </Box>

      <Text size="x3" weight="x2">
        {label}
      </Text>
    </Box>
  );
}
