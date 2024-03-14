import { type Project, ProjectKey } from '@hogg/common';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.line_segment_extending,
  name: 'Extending a line segment to the edges of a box',
  description:
    'Using linear algebra to extend a line segment existing within the bounds of a box to expand it to the edges.',
  image: '',
  imageDark: '',
  tags: ['geometry', 'rust', 'canvas', 'wasm'],
};
