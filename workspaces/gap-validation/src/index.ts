import { type Project, ProjectKey } from '@hogg/common';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.gap_validation,
  name: 'Validating a tiled plane for gaps',
  description:
    'An approach for checking a tiled plane for gaps by ensure there is a single continuous perimeter.',
  tags: ['algorithms', 'data structures', 'sequences', 'rust'],
  deploy: false,
  wip: true,
  created: '2099-12-12',
  updated: '2099-12-12',
};
