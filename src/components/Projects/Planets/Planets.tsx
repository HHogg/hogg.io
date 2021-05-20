import * as React from 'react';
import {
  Appear,
  Button,
  Buttons,
  Flex,
  Text,
  useResizeObserver,
} from 'preshape';
import data from '../../../data';
import { RootContext } from '../../Root';
import ProjectPage from '../../ProjectPage/ProjectPage';
import PlanetsVisual from './PlanetsVisual';

export type ConfigDrawMode = 'points' | 'lines' | 'faces';

const Planets = () => {
  const { onChangeTheme, theme } = React.useContext(RootContext);
  const refTheme = React.useRef(theme);
  const [mode, setMode] = React.useState<ConfigDrawMode>('faces');
  const [size, ref] = useResizeObserver();

  React.useEffect(() => {
    onChangeTheme('night');

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      onChangeTheme(refTheme.current);
    };
  }, [onChangeTheme]);

  return (
    <ProjectPage { ...data.projects.Planet } themeable={ false }>
      <Flex
          basis="none"
          container
          direction="vertical"
          gap="x4"
          grow
          padding="x4">
        <Flex container grow minHeight="35rem">
          <Flex
              absolute="edge-to-edge"
              direction="vertical"
              grow
              ref={ ref }>
            { !!(size.height && size.width) && (
              <PlanetsVisual
                  drawMode={mode}
                  height={ size.height }
                  width={ size.width } />
            ) }
          </Flex>
        </Flex>

        <Flex
            alignChildren="middle"
            direction="horizontal"
            gap="x8">
          <Flex>
            <Buttons joined>
              <Button
                  active={ mode === 'points' }
                  gap="x1"
                  onClick={ () => setMode('points') }>
                Points
              </Button>
              <Button
                  active={ mode === 'lines' }
                  gap="x1"
                  onClick={ () => setMode('lines') }>
                Lines
              </Button>
              <Button
                  active={ mode === 'faces' }
                  gap="x1"
                  onClick={ () => setMode('faces') }>
                Faces
              </Button>
            </Buttons>
          </Flex>
        </Flex>
      </Flex>
    </ProjectPage>
  );
};

export default Planets;
