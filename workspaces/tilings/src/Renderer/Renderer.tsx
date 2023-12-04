import { BoxProps } from 'preshape';
import WasmProvider from '../WasmProvider/WasmProvider';
import RendererContent, { RendererProps } from './RendererContent';

export default function Renderer(props: BoxProps & RendererProps) {
  return (
    <WasmProvider>
      <RendererContent {...props} />
    </WasmProvider>
  );
}
