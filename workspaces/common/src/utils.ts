import { Project } from './types';

export function getProjectRoutePath(project: Project): string {
  return `/projects/${project.id}`;
}
