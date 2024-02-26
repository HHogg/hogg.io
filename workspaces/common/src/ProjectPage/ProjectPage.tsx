import { BoxProps } from 'preshape';
import { useEffect } from 'react';
import ProjectPageWithArticle, {
  ProjectPageWithArticleProps,
} from './ProjectPageWithArticle';
import ProjectPageWithoutArticle from './ProjectPageWithoutArticle';

export type ProjectPageProps = BoxProps & {
  layout: ProjectPageWithArticleProps['layout'];
};

type ProjectPageInnerProps = ProjectPageProps & {
  article?: JSX.Element;
  presentation: JSX.Element;
};

export default function ProjectPage({
  article,
  layout,
  presentation,
  ...rest
}: ProjectPageInnerProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (article) {
    return (
      <ProjectPageWithArticle
        {...rest}
        article={article}
        layout={layout}
        presentation={presentation}
      />
    );
  }

  return <ProjectPageWithoutArticle {...rest} presentation={presentation} />;
}
