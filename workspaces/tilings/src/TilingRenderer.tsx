import { WasmApiLoadingScreen } from '@hogg/wasm';
import { BoxProps } from 'preshape';
import ArrangementProvider from './Presentation/Arrangement/ArrangementProvider';
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
  validations,
  ...rest
}: TilingRendererProps) {
  return (
    <WasmApiLoadingScreen>
      <NotationProvider isValid={isValid} notation={notation}>
        <ArrangementProvider>
          <Renderer
            {...rest}
            expansionPhases={expansionPhases}
            options={options}
            validations={validations}
          />
        </ArrangementProvider>
      </NotationProvider>
    </WasmApiLoadingScreen>
  );
}
