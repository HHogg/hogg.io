import { Box, useMatchMedia } from 'preshape';
import React, { useState } from 'react';
import data from '../../../data';
import ProjectPage from '../../ProjectPage/ProjectPage';
import Editor from './Editor/Editor';
import Gallery from './Gallery/Gallery';
import configurations from './Gallery/configurations';

const CircleArt = () => {
  const match = useMatchMedia(['1000px']);
  const [circleData, setCircleData] = useState(configurations[0]);

  return (
    <ProjectPage {...data.projects.CircleArt}>
      <Box flex={match('1000px') ? 'horizontal' : 'vertical'} gap="x3" grow>
        <Box
          backgroundColor="background-shade-2"
          basis="0"
          borderRadius="x3"
          flex="vertical"
          grow
        >
          <Editor data={circleData.config} />
        </Box>

        <Box basis="0" maxHeight="100%">
          <Gallery onSelect={setCircleData} />
        </Box>
      </Box>
    </ProjectPage>
  );
};

export default CircleArt;
