import { type Project, ProjectKey } from '@hogg/common';
import image from './image.webp';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.snake,
  name: 'Using heuristics for the optimal solution to the game of Snake',
  description:
    'Using a combination of A* and a heuristic function to produce the optimal solution for solving the classic game of snake.',
  image,
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
  created: '2016-11-18',
  updated: '2024-03-17',
};
