import { type Project, ProjectKey } from '@hogg/common';
import image from './image.webp';

export { default as Project } from './Project';
export { default as TilingRenderer } from './TilingRenderer';

export const meta: Project = {
  id: ProjectKey.tilings,
  image,
  name: 'Searching, generating, validating and rendering Euclidean tilings',
  description: `A long term project to generate Euclidean tilings by developing a notation to describe them, a structure generator, a validator and a renderer.`,
  wip: true,
  deploy: true,
  tags: [
    'data structures',
    'geometry',
    'react',
    'rust',
    'webassembly',
    'typescript',
    'actors',
  ],
  created: '2024-04-01',
  updated: '2024-04-01',
};
