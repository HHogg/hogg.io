import { PropsWithChildren } from 'react';
import { UsePlayerOptions, usePlayer } from './usePlayer';
import { PlayerContext } from './usePlayerContext';

export type PlayerProviderProps = {
  options?: Partial<UsePlayerOptions>;
};

export default function PlayerProvider({
  options,
  ...rest
}: PropsWithChildren<PlayerProviderProps>) {
  return <PlayerContext.Provider {...rest} value={usePlayer(options)} />;
}
