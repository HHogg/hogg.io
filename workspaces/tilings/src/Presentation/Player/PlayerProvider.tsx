import { PropsWithChildren, useMemo } from 'react';
import { Callbacks, usePlayer, UsePlayerProps } from './usePlayer';
import { PlayerContext } from './usePlayerContext';

export default function PlayerProvider({
  onEnd,
  ...rest
}: PropsWithChildren<Callbacks & UsePlayerProps>) {
  const callbacks = useMemo(() => ({ onEnd }), [onEnd]);

  return (
    <PlayerContext.Provider
      {...rest}
      value={usePlayer({
        callbacks,
        ...rest,
      })}
    />
  );
}
