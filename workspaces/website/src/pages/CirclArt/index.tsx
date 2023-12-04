import { EditorProjectWindow, configurations } from '@hogg/circles';
import { useState } from 'react';
import ProjectPage from '../../components/ProjectPage/ProjectPage';
import ProjectPageProvider from '../../components/ProjectPage/ProjectPageProvider';
import { ProjectKey } from '../../types';
import Article from './Article';

export default function CircleArt() {
  const [data, setData] = useState(configurations[0]);

  return (
    <ProjectPageProvider id={ProjectKey.CircleArt}>
      <ProjectPage
        article={<Article />}
        presentation={
          <EditorProjectWindow data={data.config} onSelect={setData} />
        }
      />
    </ProjectPageProvider>
  );
}
