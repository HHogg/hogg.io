import { type Project, ProjectKey } from '@hogg/common';
import imageDark from './circle-art-dark.webp';
import image from './circle-art.webp';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.circle_art,
  name: 'Illustration app using only circle intersections',
  image,
  imageDark,
  description:
    'Using a circle intersection graph to create a simple illustration app that can be used to create art from circles.',
  tags: ['data structures', 'geometry', 'react', 'svg', 'typescript'],
  deploy: true,
};
