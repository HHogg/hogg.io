import { Project, ProjectKey } from '@hogg/common';
import image from './circle-graph.webp';

export { default as Project } from './Project';

export { default as useGraph } from './useGraph';
export * from './useGraph';

export { default as atan2 } from './utils/atan2';
export { default as isPointOverCircleEdge } from './utils/isPointOverCircleEdge';
export { default as isPointWithinCircle } from './utils/isPointWithinCircle';
export { default as getTraversalPath } from './utils/getTraversalPath';

export const meta: Project = {
  id: ProjectKey.circle_intersections,
  name: 'Circle intersections with graph data structures',
  image,
  description:
    'Using circle intersection pairs and 5 simple rules to create a graph data structure that can be used to find all the intersection areas of circles.',
  tags: ['data structures', 'geometry', 'react', 'svg', 'typescript'],
  created: '2020-02-14',
  updated: '2024-03-16',
  deploy: true,
};
