import { createContext, useContext } from 'react';
import { Project } from '../types';

export const ProjectPageContext = createContext<Project>({} as Project);

export const useProjectPageContext = () => {
  return useContext(ProjectPageContext);
};
