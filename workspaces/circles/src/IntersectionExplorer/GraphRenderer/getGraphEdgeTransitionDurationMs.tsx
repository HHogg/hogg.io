import { transitionTimeSlow } from 'preshape';

export const getGraphEdgeTransitionDurationMs = (speed: number) =>
  transitionTimeSlow / speed;
