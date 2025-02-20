import { PropsWithChildren, useMemo } from 'react';
import { Callbacks, usePlayer } from './usePlayer';
import { PlayerContext } from './usePlayerContext';

export default function PlayerProvider({
  onEnd,
  ...rest
}: PropsWithChildren<Callbacks>) {
  const callbacks = useMemo(() => ({ onEnd }), [onEnd]);

  return <PlayerContext.Provider {...rest} value={usePlayer(callbacks)} />;
}
