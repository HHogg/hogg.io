import { type Project, ProjectKey } from '@hogg/common';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.tilings_validate_overlaps,
  name: 'Validating Overlaps in Euclidean Tilings',
  description: '...',
  tags: ['algorithm', 'data structures', 'rust'],
  deploy: false,
  wip: true,
  created: '2099-99-99',
  updated: '2099-99-99',
};
