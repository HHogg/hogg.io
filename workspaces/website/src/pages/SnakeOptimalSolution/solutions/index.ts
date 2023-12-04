import { euclideanDistance } from './euclideanDistance';
import { hamiltonianCycle } from './hamiltonianCycle';
import { manhattanDistance } from './manhattanDistance';
import { tailEscape } from './tailEscape';

export type Solution = {
  name: string;
  average: number;
  points: number;
  score: number;
  content: string;
};

export { hamiltonianCycle, euclideanDistance, manhattanDistance, tailEscape };

const solutions = [
  hamiltonianCycle,
  euclideanDistance,
  manhattanDistance,
  tailEscape,
].sort((a, b) => b.score - a.score);

export default solutions;
