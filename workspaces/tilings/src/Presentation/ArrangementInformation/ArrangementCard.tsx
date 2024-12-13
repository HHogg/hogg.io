import { DeepPartial, PatternBackground } from '@hogg/common';
import { Options, ColorPalette, ScaleMode, Layer } from '@hogg/wasm';
import { Box, Text } from 'preshape';
import TilingRenderer, { TilingRendererProps } from '../../TilingRenderer';

export type ArrangementCardProps = Omit<TilingRendererProps, 'notation'> & {
  label: string;
  notation: string;
};

const options: DeepPartial<Options> = {
  colorPalette: ColorPalette.None,
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
