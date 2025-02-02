import { Link, LinkProps } from 'preshape';
import { PropsWithChildren } from 'react';
import { Project } from '../types';
import { getProjectRoutePath } from '../utils';

type Props = {
  project: Project;
};

export default function ProjectPageLink({
  children,
  project,
  ...rest
}: PropsWithChildren<Props & LinkProps>) {
  return (
    <Link to={getProjectRoutePath(project)} underline {...rest}>
      {children ? children : `'${project.name}'`}
    </Link>
  );
}
