import { Box, Editor, useLocalStorage, useMatchMedia } from 'preshape';
import React, { useMemo } from 'react';
import data from '../../../data';
import useEnforcedTheme from '../../../utils/useEnforcedTheme';
import ProjectPage from '../../ProjectPage/ProjectPage';
import SnakeControls from './SnakeControls';
import SnakeProvider from './SnakeProvider';
import SnakeScoreTiles from './SnakeScoreTiles';
import SnakeViewer from './SnakeViewer';
import { tailEscape } from './solutions';
import { TypeSolution } from './types';

import 'brace/mode/javascript';

const Snake = () => {
  const match = useMatchMedia(['1000px']);
  const [editorState, setEditorState] = useLocalStorage<TypeSolution>(
    'com.hogg.snake.editor',
    tailEscape
  );

  const worker = useMemo(() => {
    return new Worker('./SnakeRunnerWorker.ts');
  }, []);

  useEnforcedTheme('night');

  const onChange = (content: string) => {
    setEditorState({ ...editorState, content });
  };

  return (
    <ProjectPage {...data.projects.Snake}>
      <SnakeProvider solution={editorState.content} worker={worker}>
        <Box
          flex={match('1000px') ? 'horizontal' : 'vertical'}
          gap="x6"
          grow
          reverse={!match('1000px')}
        >
          <Box
            backgroundColor="background-shade-2"
            basis="0"
            borderRadius="x3"
            flex="vertical"
            grow
            padding="x6"
          >
            <Editor
              language="javascript"
              minHeight="30rem"
              onChange={onChange}
              value={editorState.content}
            />
          </Box>

          <Box
            backgroundColor="background-shade-2"
            basis="0"
            borderRadius="x3"
            flex="vertical"
            gap="x6"
            grow
            padding="x6"
          >
            <Box basis="0" flex="vertical" grow>
              <SnakeViewer minHeight="20rem" />
            </Box>

            <Box>
              <SnakeScoreTiles />
            </Box>

            <Box>
              <SnakeControls />
            </Box>
          </Box>
        </Box>
      </SnakeProvider>
    </ProjectPage>
  );
};

export default Snake;
