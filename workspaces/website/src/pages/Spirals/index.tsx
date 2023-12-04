import { SpiralsProjectWindow, SpiralsProvider } from '@hogg/spirals';
import ProjectPage from '../../components/ProjectPage/ProjectPage';
import ProjectPageProvider from '../../components/ProjectPage/ProjectPageProvider';
import { ProjectKey } from '../../types';
import Article from './Article';

export default function SpiralsPage() {
  return (
    <ProjectPageProvider id={ProjectKey.Spirals}>
      <SpiralsProvider>
        <ProjectPage
          presentation={<SpiralsProjectWindow />}
          article={<Article />}
        />
      </SpiralsProvider>
    </ProjectPageProvider>
  );
}
