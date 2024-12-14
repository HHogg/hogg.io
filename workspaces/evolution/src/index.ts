import { type Project, ProjectKey } from '@hogg/common';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.evolution,
  name: 'Genes to Phenotype visualisation',
  description:
    'Representing the complexity of how genes are expressed in an organism as its phenotype.',
  tags: ['simulation', 'rust'],
  deploy: false,
  wip: true,
  created: '2099-12-12',
  updated: '2099-12-12',
};
