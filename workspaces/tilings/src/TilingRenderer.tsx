import { WasmApiLoadingScreen } from '@hogg/wasm';
import { BoxProps } from 'preshape';
import NotationProvider, {
  NotationProviderProps,
} from './Presentation/Notation/NotationProvider';
import Renderer, { RendererProps } from './Presentation/Renderer/Renderer';

export type TilingRendererProps = BoxProps &
  NotationProviderProps &
  RendererProps;

export default function TilingRenderer({
  expansionPhases,
  isValid,
  notation,
  options,
  ...rest
}: TilingRendererProps) {
  return (
    <WasmApiLoadingScreen>
      <NotationProvider isValid={isValid} notation={notation}>
        <Renderer
          {...rest}
          expansionPhases={expansionPhases}
          options={options}
        />
      </NotationProvider>
    </WasmApiLoadingScreen>
  );
}
