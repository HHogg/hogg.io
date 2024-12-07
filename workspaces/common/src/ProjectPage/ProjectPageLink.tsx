import { Link, LinkProps } from 'preshape';
import { Project } from '../types';
import { getProjectRoutePath } from '../utils';

type Props = {
  project: Project;
};

export default function ProjectPageLink({
  project,
  ...rest
}: Props & LinkProps) {
  return (
    <Link to={getProjectRoutePath(project)} underline {...rest}>
      '{project.name}'
    </Link>
  );
}
