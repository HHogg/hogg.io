import { BoxProps } from 'preshape';
import ArrangementProvider from './Presentation/Arrangement/ArrangementProvider';
import NotationProvider, {
  NotationProviderProps,
} from './Presentation/Notation/NotationProvider';
import Renderer, { RendererProps } from './Presentation/Renderer/Renderer';
import WasmApi from './Presentation/WasmApi/WasmApi';

export type TilingRendererProps = BoxProps &
  NotationProviderProps &
  RendererProps;

export default function TilingRenderer({
  isValid,
  notation,
  options,
  validations,
  ...rest
}: TilingRendererProps) {
  return (
    <WasmApi>
      <NotationProvider isValid={isValid} notation={notation}>
        <ArrangementProvider>
          <Renderer {...rest} options={options} validations={validations} />
        </ArrangementProvider>
      </NotationProvider>
    </WasmApi>
  );
}
