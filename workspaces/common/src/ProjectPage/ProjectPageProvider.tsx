import { PropsWithChildren } from 'react';
import { Project } from '../types';
import { ProjectPageContext } from './useProjectPageContext';

type ProjectPageProviderProps = {
  project: Project;
};

export default function ProjectPageProvider({
  project,
  ...rest
}: PropsWithChildren<ProjectPageProviderProps>) {
  return <ProjectPageContext.Provider {...rest} value={project} />;
}
