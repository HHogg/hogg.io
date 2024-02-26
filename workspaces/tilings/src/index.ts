import { type Project, ProjectKey } from '@hogg/common';
import image from './euclidean-tilings.webp';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.tilings,
  image,
  name: 'Searching and rendering Euclidean tilings with Rust and a multithreaded actor architecture',
  description:
    'Developing a notation used to reference unique regular polygon tilings, a searching algorithm to discover them and a renderer to display them for the web.',
  wip: true,
  tags: [
    'data structures',
    'geometry',
    'react',
    'rust',
    'webassembly',
    'typescript',
    'actors',
  ],
};
