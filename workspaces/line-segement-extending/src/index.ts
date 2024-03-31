import { type Project, ProjectKey } from '@hogg/common';
import image from './image.webp';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.line_segment_extending,
  name: 'Extending a line segment to the edges of a box',
  description:
    'Extending line segments to annotate transformation lines using Rust, focusing on mathematical concepts and line intersection techniques to accurately represent these transforms in a bounded area.',
  image,
  tags: ['geometry', 'rust', 'canvas', 'wasm'],
  created: '2024-04-01',
  updated: '2024-04-01',
  deploy: true,
};
