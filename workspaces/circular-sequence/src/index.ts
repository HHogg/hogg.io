import { type Project, ProjectKey } from '@hogg/common';
import image from './image.webp';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.circular_sequence,
  name: 'Symmetric circular sequences',
  description:
    "identifying and comparing unique geometric shape arrangements without a defined start or endpoint, utilizing Rust's efficient fixed-length arrays and implementing a series of algorithms for sequence normalization and symmetry detection.",
  image,
  tags: ['algorithms', 'data structures', 'sequences', 'rust'],
  deploy: true,
  created: '2024-03-17',
  updated: '2024-03-17',
};
