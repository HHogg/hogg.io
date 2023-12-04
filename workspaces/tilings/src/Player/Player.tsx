import { BoxProps } from 'preshape';
import { RendererProps } from '../Renderer/RendererContent';
import PlayerInner from './PlayerInner';
import PlayerProvider, { PlayerProviderProps } from './PlayerProvider';

export type PlayerProps = RendererProps & PlayerProviderProps;

export default function Player({ options, ...rest }: BoxProps & PlayerProps) {
  return (
    <PlayerProvider options={options}>
      <PlayerInner {...rest} />
    </PlayerProvider>
  );
}
