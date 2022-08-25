import { Box, Link, Text, useMatchMedia } from 'preshape';
import React, { useState } from 'react';
import data from '../../../data';
import ProjectPage from '../../ProjectPage/ProjectPage';
import Editor from './Editor/Editor';
import Gallery from './Gallery/Gallery';
import configurations from './Gallery/configurations';
import { CircleArtGalleryItem } from './types';

const CircleArt = () => {
  const match = useMatchMedia(['1000px']);
  const [circleData, setCircleData] = useState<CircleArtGalleryItem | null>(
    configurations[0]
  );

  const handleEditorChange = () => {
    setCircleData(null);
  };

  return (
    <ProjectPage {...data.projects.CircleArt}>
      <Box flex={match('1000px') ? 'horizontal' : 'vertical'} gap="x3" grow>
        <Box
          backgroundColor="background-shade-2"
          basis="0"
          borderRadius="x3"
          container
          flex="vertical"
          grow
        >
          <Editor data={circleData?.config} onChange={handleEditorChange} />

          {circleData?.author && (
            <Box absolute="top-left" padding="x4">
              <Text strong>{circleData.author}</Text>
              <Link href={circleData.authorUrl} isTextLink size="x2">
                {circleData.authorUrl}
              </Link>
            </Box>
          )}
        </Box>

        <Box basis="0" maxHeight="100%">
          <Gallery onSelect={setCircleData} />
        </Box>
      </Box>
    </ProjectPage>
  );
};

export default CircleArt;
