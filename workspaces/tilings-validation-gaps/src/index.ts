import { type Project, ProjectKey } from '@hogg/common';
import image from './image.webp';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.tilings_validate_gaps,
  name: 'Detecting Gaps in Euclidean Tilings',
  description:
    'Short article explaining how to detect gaps in tilings using line segments to form complete circuits, in linear time.',
  image,
  tags: ['algorithm', 'data structures', 'rust'],
  deploy: true,
  created: '2025-02-04',
  updated: '2025-02-04',
};
