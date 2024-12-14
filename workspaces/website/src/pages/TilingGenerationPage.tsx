import { TilingRenderer } from '@hogg/tilings';
import { ColorMode, Options, ScaleMode } from '@hogg/wasm';
import { useSearchParams } from 'react-router-dom';

const options: Options = {
  autoRotate: true,
  colorMode: ColorMode.VaporWaveRandom,
  scaleMode: ScaleMode.Cover,
  styles: {},
};

export default function TilingGenerationPage() {
  const [params] = useSearchParams();
  const notation = params.get('notation') ?? '';

  return (
    <TilingRenderer
      expansionPhases={10}
      notation={notation}
      options={options}
    />
  );
}
