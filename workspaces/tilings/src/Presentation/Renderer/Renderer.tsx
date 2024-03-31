import { BoxProps } from 'preshape';
import { memo } from 'react';
import WasmApi from '../WasmApi/WasmApi';
import RendererContent, { RendererProps } from './RendererContent';

export default memo(function Renderer(props: BoxProps & RendererProps) {
  return (
    <WasmApi>
      <RendererContent {...props} />
    </WasmApi>
  );
});
