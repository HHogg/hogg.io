import { type Project, ProjectKey } from '@hogg/common';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.circular_sequence,
  name: 'Symmetric circular sequences',
  description:
    'Matching sequences of numbers that have no defined start or end, and some that could considered symmetric by producing the same path in both directions.',
  image: '',
  tags: ['algorithms', 'data structures', 'sequences', 'rust'],
};
