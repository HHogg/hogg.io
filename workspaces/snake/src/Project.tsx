import { ProjectPage, ProjectPageProps } from '@hogg/common';
import { useState } from 'react';
import Article from './Article';
import solutions, { Solution } from './Article/solutions';
import Presentation from './Presentation';

export default function Project(props: ProjectPageProps) {
  const [autoRun, setAutoRun] = useState(false);
  const [solution, setSolution] = useState(solutions[0]);

  const handleSelectSolution = (solution: Solution) => {
    setSolution(solution);
    setAutoRun(true);
  };

  return (
    <ProjectPage
      {...props}
      article={<Article onSelectSolution={handleSelectSolution} />}
      presentation={<Presentation autoRun={autoRun} solution={solution} />}
    />
  );
}
