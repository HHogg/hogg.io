import { SnakeProjectWindow } from '@hogg/snake';
import { useState } from 'react';
import ProjectPage from '../../components/ProjectPage/ProjectPage';
import ProjectPageProvider from '../../components/ProjectPage/ProjectPageProvider';
import { ProjectKey } from '../../types';
import Article from './Article';
import solutions, { Solution } from './solutions';

export default function SnakeOptimalSolution() {
  const [autoRun, setAutoRun] = useState(false);
  const [solution, setSolution] = useState(solutions[0]);

  const handleSelectSolution = (solution: Solution) => {
    setSolution(solution);
    setAutoRun(true);
  };

  return (
    <ProjectPageProvider id={ProjectKey.SnakeOptimalSolution}>
      <ProjectPage
        article={<Article onSelectSolution={handleSelectSolution} />}
        presentation={
          <SnakeProjectWindow autoRun={autoRun} solution={solution} />
        }
      />
    </ProjectPageProvider>
  );
}
