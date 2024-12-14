import { ProjectPage, ProjectPageProps } from '@hogg/common';
import Article from './Article';
import Presentation from './Presentation';

export default function Project(props: ProjectPageProps) {
  return (
    <ProjectPage
      {...props}
      article={<Article />}
      presentation={<Presentation />}
    />
  );
}
