import { ProjectPage, ProjectPageProps } from '@hogg/common';
import Article from './Article';

export default function Project(props: ProjectPageProps) {
  return <ProjectPage {...props} article={<Article />} />;
}
