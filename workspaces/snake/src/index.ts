import { type Project, ProjectKey } from '@hogg/common';
// import imageDark from './snake-dark.webp';
import image from './image.webp';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.snake,
  name: 'Using heuristics for the optimal solution to the game of Snake',
  description:
    'Using a combination of A* and a heuristic function to produce the optimal solution for solving the classic game of snake.',
  image,
  // imageDark,
  tags: [
    'algorithms',
    'canvas',
    'css',
    'data structures',
    'heuristics',
    'react',
    'typescript',
  ],
  deploy: true,
};
