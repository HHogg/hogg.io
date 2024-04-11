import { ColorMode, Options, ScaleMode, TilingRenderer } from '@hogg/tilings';
import { useSearchParams } from 'react-router-dom';

const options: Options = {
  autoRotate: true,
  colorMode: ColorMode.VaporWaveRandom,
  expansionPhases: 6,
  scaleMode: ScaleMode.Fixed,
  scaleSize: 20,
  styles: {},
};

export default function TilingGenerationPage() {
  const [params] = useSearchParams();
  const notation = params.get('notation') ?? '';

  return <TilingRenderer notation={notation} options={options} />;
}
