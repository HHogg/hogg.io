import { BoxProps } from 'preshape';
import { useEffect } from 'react';
import ProjectPageDualView, {
  ProjectPageDualViewProps,
} from './ProjectPageDualView';
import ProjectPageSingleView from './ProjectPageSingleView';

export type ProjectPageProps = BoxProps & {
  layout: ProjectPageDualViewProps['layout'];
};

type ProjectPageInnerProps = ProjectPageProps & {
  article?: JSX.Element;
  presentation?: JSX.Element;
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

  if (article && presentation) {
    return (
      <ProjectPageDualView
        {...rest}
        article={article}
        layout={layout}
        presentation={presentation}
      />
    );
  }

  if (article) {
    return <ProjectPageSingleView {...rest} content={article} />;
  }

  if (presentation) {
    return <ProjectPageSingleView {...rest} content={presentation} />;
  }

  throw new Error('ProjectPage requires either an article or a presentation.');
}
