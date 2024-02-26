import { BoxProps } from 'preshape';
import WasmApi from '../WasmApi/WasmApi';
import RendererContent, { RendererProps } from './RendererContent';

export default function Renderer(props: BoxProps & RendererProps) {
  return (
    <WasmApi>
      <RendererContent {...props} />
    </WasmApi>
  );
}
