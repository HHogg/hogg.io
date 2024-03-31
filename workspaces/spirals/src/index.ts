import { type Project, ProjectKey } from '@hogg/common';
import image from './image.webp';

export { default as Project } from './Project';
export * from './Presentation/algorithms';

export const meta: Project = {
  id: ProjectKey.spirals,
  name: 'Rendering spirals and radial patterns with particles in WebGL',
  image,
  description:
    'A WebGL experiment to render and animate spirals and radial patterns with particles, involving some trigonometry and graphing equations.',
  tags: ['algorithms', 'geometry', 'react', 'typescript', 'webgl'],
  deploy: true,
  created: '2018-05-22',
  updated: '2024-03-17',
};
