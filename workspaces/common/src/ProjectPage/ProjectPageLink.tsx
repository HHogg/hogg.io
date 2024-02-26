import { Link } from 'preshape';
import { Project } from '../types';
import { getProjectRoutePath } from '../utils';

type Props = {
  project: Project;
};

export default function ProjectPageLink({ project }: Props) {
  return (
    <Link to={getProjectRoutePath(project)} underline>
      '{project.name}'
    </Link>
  );
}
