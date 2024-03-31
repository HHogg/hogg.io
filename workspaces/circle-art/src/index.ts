import { type Project, ProjectKey } from '@hogg/common';
import image from './circle-art.webp';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.circle_art,
  name: 'Illustration app using only circle intersections',
  description:
    'Using a circle intersection graph to create a simple illustration app that can be used to create art from circles.',
  created: '2020-02-14',
  updated: '2024-03-16',
  image,
  tags: ['data structures', 'geometry', 'react', 'svg', 'typescript'],
  deploy: true,
};
