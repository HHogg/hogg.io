import { type Project, ProjectKey } from '@hogg/common';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.line_segment_extending,
  name: 'Extending a line segment to the edges of a box',
  image: '',
  imageDark: '',
  description: '',
  tags: ['geometry', 'rust', 'canvas'],
};
