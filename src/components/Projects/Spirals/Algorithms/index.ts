export interface Algorithm {
  (config: SpiralConfig): [number, number][];
  NORMALISATION_FACTOR: number;
}

export interface SpiralConfig {
  cover: boolean;
  height: number;
  width: number;
  xCenter: number;
  xDistance: number;
  yDistance: number;
  yCenter: number;
}

export { default as ArchimedesSpiral } from './ArchimedesSpiral';
export { default as ConcentricCircles } from './ConcentricCircles';
export { default as FermatSpiral } from './FermatSpiral';
export { default as UlamSpiral } from './UlamSpiral';
export { default as VogelSpiral } from './VogelSpiral';
