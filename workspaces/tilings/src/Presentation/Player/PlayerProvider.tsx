import { PropsWithChildren } from 'react';
import { usePlayer } from './usePlayer';
import { PlayerContext } from './usePlayerContext';

export default function PlayerProvider({ ...rest }: PropsWithChildren<{}>) {
  return <PlayerContext.Provider {...rest} value={usePlayer()} />;
}
