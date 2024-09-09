import { type Project, ProjectKey } from '@hogg/common';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.evolution,
  name: 'Genes to Phenotype visualisation',
  description:
    'Representing the complexity of how genes are expressed in an organism as its phenotype.',
  // image,
  tags: ['simulation', 'rust'],
  deploy: false,
  wip: true,
  created: '2024-05-04',
  updated: '2024-05-04',
};
