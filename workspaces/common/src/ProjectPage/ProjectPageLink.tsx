import { Link, LinkProps } from 'preshape';
import { Project } from '../types';
import { getProjectRoutePath } from '../utils';

type Props = {
  project: Project;
};

export default function ProjectPageLink({ project }: Props & LinkProps) {
  return (
    <Link to={getProjectRoutePath(project)} underline>
      '{project.name}'
    </Link>
  );
}
