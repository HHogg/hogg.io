import { PropsWithChildren } from 'react';
import { projectsByKey } from '../../data';
import { ProjectKey } from '../../types';
import { ProjectPageContext } from './useProjectPageContext';

type ProjectPageProviderProps = {
  id: ProjectKey;
};

export default function ProjectPageProvider({
  id,
  ...rest
}: PropsWithChildren<ProjectPageProviderProps>) {
  return <ProjectPageContext.Provider {...rest} value={projectsByKey[id]} />;
}
