import { type Project, ProjectKey } from '@hogg/common';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.grahams_scan,
  name: 'Using Grahams Scan to scale a tiled plane to cover a rectangle',
  description:
    'Stuck with the problem on how to cover a rectangle with a tiled place, this article explains how to use Grahams Scan to identify the convex hull and scale it to cover the rectangle.',
  tags: ['algorithms', 'data structures', 'rust', 'grahams scan'],
  deploy: false,
  wip: true,
  created: '2099-12-12',
  updated: '2099-12-12',
};
