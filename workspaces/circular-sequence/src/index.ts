import { type Project, ProjectKey } from '@hogg/common';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.circular_sequence,
  name: 'Symmetrical circular sequences',
  description:
    'Comparing sequences of numbers that have no defined start or end, and some that can be traversed in both directions to produce the same paths.',
  image: '',
  tags: ['algorithms', 'data structures', 'sequences', 'rust'],
};
