import { type Project, ProjectKey } from '@hogg/common';
import imageDark from './spirals-dark.webp';
import image from './spirals.webp';

export { default as Project } from './Project';
export * from './Presentation/algorithms';

export const meta: Project = {
  id: ProjectKey.spirals,
  name: 'Rendering and animating particles into spirals and radial patterns',
  image,
  imageDark,
  description:
    'A WebGL experiment to render and animate spirals and radial patterns with particles, involving some trigonometry and graphing equations.',
  tags: ['algorithms', 'geometry', 'react', 'typescript', 'webgl'],
};
