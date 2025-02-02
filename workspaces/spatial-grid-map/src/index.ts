import { type Project, ProjectKey } from '@hogg/common';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.spatial_grid_map,
  name: 'Using a spatial grid map for efficient floating point lookup',
  description:
    'A method for subdividing a euclidean tiling plane into a grid of bits for quickly checking an area for the existence of polygon components and performing collision detection',
  tags: ['algorithms', 'data structures', 'rust'],
  deploy: false,
  wip: true,
  created: '2099-12-12',
  updated: '2099-12-12',
};
