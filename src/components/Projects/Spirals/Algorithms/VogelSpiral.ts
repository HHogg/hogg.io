import { SpiralConfig } from '.';
import FermatSpiral from './FermatSpiral';

const VogelSpiral = (config: SpiralConfig) => FermatSpiral(config, 2.39998131);

VogelSpiral.NORMALISATION_FACTOR = 2.025;

export default VogelSpiral;
