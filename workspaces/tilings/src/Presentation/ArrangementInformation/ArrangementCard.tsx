import { DeepPartial, PatternBackground } from '@hogg/common';
import { Box, Text } from 'preshape';
import TilingRenderer, { TilingRendererProps } from '../../TilingRenderer';
import { ColorMode, Layer, Options, ScaleMode } from '../../types';

export type ArrangementCardProps = Omit<TilingRendererProps, 'notation'> & {
  label: string;
  notation: string;
};

const options: DeepPartial<Options> = {
  colorMode: ColorMode.None,
  scaleMode: ScaleMode.Contain,
  showLayers: {
    [Layer.ConvexHull]: false,
  },
};

export default function ArrangementCard({
  label,
  notation,
  ...rest
}: ArrangementCardProps) {
  return (
    <Box flex="vertical" alignChildren="middle" gap="x2">
      <PatternBackground
        padding="x2"
        backgroundColor="background-shade-2"
        borderRadius="x2"
        borderSize="x1"
        borderColor="background-shade-4"
        width="100%"
      >
        <TilingRenderer {...rest} notation={notation} options={options} />
      </PatternBackground>

      <Text size="x3" weight="x2">
        {label}
      </Text>
    </Box>
  );
}
