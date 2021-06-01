import * as React from 'react';
import { Flex, useResizeObserver } from 'preshape';
import data from '../../../../data';
import { RootContext } from '../../../Root';
import ProjectPage from '../../../ProjectPage/ProjectPage';
import RorschachVisual from './RorschachVisual';

const Rorschach = () => {
  const { onChangeTheme, theme } = React.useContext(RootContext);
  const refTheme = React.useRef(theme);
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
              <RorschachVisual
                  height={ size.height }
                  width={ size.width } />
            ) }
          </Flex>
        </Flex>
      </Flex>
    </ProjectPage>
  );
};

export default Rorschach;
