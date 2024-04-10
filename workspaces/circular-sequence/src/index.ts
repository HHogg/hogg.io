import { type Project, ProjectKey } from '@hogg/common';
import image from './image.webp';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.circular_sequence,
  name: 'Matching symmetric circular sequences with Knuth-Morris-Pratt (KMP)',
  description:
    'identifying and comparing unique geometric shape arrangements without a defined start or endpoint using the Knuth-Morris-Pratt algorithm in Rust.',
  image,
  tags: ['algorithms', 'data structures', 'sequences', 'rust'],
  deploy: true,
  created: '2024-03-17',
  updated: '2024-04-10',
};
