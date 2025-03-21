import { TilingRenderer } from '@hogg/tilings';
import { ColorMode, ColorPalette, Options, ScaleMode } from '@hogg/wasm';
import { useSearchParams } from 'react-router-dom';

const options: Options = {
  autoRotate: true,
  colorMode: ColorMode.Placement,
  colorPalette: ColorPalette.VaporWaveRandom,
  scaleMode: ScaleMode.Cover,
  styles: {},
};

export default function TilingGenerationPage() {
  const [params] = useSearchParams();
  const notation = params.get('notation') ?? '';

  return (
    <TilingRenderer
      uid="tiling-generation-page"
      repetitions={15}
      notation={notation}
      options={options}
    />
  );
}
