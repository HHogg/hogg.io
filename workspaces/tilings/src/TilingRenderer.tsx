import { WasmApiLoadingScreen } from '@hogg/wasm';
import { BoxProps } from 'preshape';
import Renderer, { RendererProps } from './Presentation/Renderer/Renderer';

export type TilingRendererProps = BoxProps & RendererProps;

export default function TilingRenderer(props: TilingRendererProps) {
  return (
    <WasmApiLoadingScreen>
      <Renderer {...props} />
    </WasmApiLoadingScreen>
  );
}
