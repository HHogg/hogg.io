import { ProjectTab, ProjectTabs, ProjectWindow } from '@hogg/common';
import { CodeIcon } from 'lucide-react';
import { CodeBlock } from 'preshape';
import SnakeControls from './SnakeControls';
import SnakeProvider from './SnakeProvider';
import SnakeRenderer from './SnakeRenderer';
import SnakeScores from './SnakeScores';
import { Solution } from './types';

type Props = {
  autoRun?: boolean;
  solution: Solution;
};

const SnakeProjectWindow = ({ autoRun, solution }: Props) => {
  return (
    <SnakeProvider autoRun={autoRun} solution={solution.content}>
      <ProjectWindow
        alignChildren="middle"
        gap="x6"
        controls={<SnakeControls />}
        shadow
        tabs={
          <ProjectTabs>
            <ProjectTab Icon={CodeIcon} name="Code">
              <CodeBlock language="typescript" size="x2">
                {solution.content}
              </CodeBlock>
            </ProjectTab>
          </ProjectTabs>
        }
        theme="night"
      >
        <SnakeRenderer grow maxWidth="400px" width="100%" />
        <SnakeScores />
      </ProjectWindow>
    </SnakeProvider>
  );
};

export default SnakeProjectWindow;
