import { WasmApiLoadingScreen } from '@hogg/wasm';
import { BoxProps } from 'preshape';
import Renderer, { RendererProps } from './Presentation/Renderer/Renderer';

export type TilingRendererProps = BoxProps & RendererProps;

export default function TilingRenderer({
  expansionPhases,
  notation,
  options,
  ...rest
}: TilingRendererProps) {
  return (
    <WasmApiLoadingScreen>
      <Renderer
        {...rest}
        expansionPhases={expansionPhases}
        notation={notation}
        options={options}
      />
    </WasmApiLoadingScreen>
  );
}
