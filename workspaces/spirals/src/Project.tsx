import { ProjectPage, ProjectPageProps } from '@hogg/common';
import Article from './Article';
import Presentation, { SpiralsProvider } from './Presentation';

export default function Project(props: ProjectPageProps) {
  return (
    <SpiralsProvider>
      <ProjectPage
        {...props}
        article={<Article />}
        presentation={<Presentation />}
      />
    </SpiralsProvider>
  );
}
