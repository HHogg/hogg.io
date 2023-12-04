import { useMatchMedia } from 'preshape';
import { useEffect } from 'react';
import { getPreviousProject, getNextProject } from '../../data';
import Header from '../Header/Header';
import Page from '../Page/Page';
import PageBackButton from '../Page/PageBackButton';
import PageChangeButtons from '../Page/PageChangeButtons';
import ProjectPageWithArticle from './ProjectPageWithArticle';
import ProjectPageWithoutArticle from './ProjectPageWithoutArticle';
import { useProjectPageContext } from './useProjectPageContext';

type ProjectPageProps = {
  article?: JSX.Element;
  presentation: JSX.Element;
};

export default function ProjectPage({
  article,
  presentation,
}: ProjectPageProps) {
  const match = useMatchMedia(['1000px']);
  const { id, name, description } = useProjectPageContext();
  const previousProject = getPreviousProject(id);
  const nextProject = getNextProject(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Page
      title={name}
      description={description}
      gap={match('1000px') ? 'x24' : 'x16'}
    >
      <Header>
        <PageBackButton title="Home" path="/" />
      </Header>

      {article ? (
        <ProjectPageWithArticle
          article={article}
          gap={match('1000px') ? 'x24' : 'x16'}
          presentation={presentation}
        />
      ) : (
        <ProjectPageWithoutArticle
          presentation={presentation}
          gap={match('1000px') ? 'x16' : 'x16'}
        />
      )}

      <PageChangeButtons
        previous={
          previousProject && {
            title: previousProject.name,
            description: previousProject.description,
            to: previousProject.id,
          }
        }
        next={
          nextProject && {
            title: nextProject.name,
            description: nextProject.description,
            to: nextProject.id,
          }
        }
      />
    </Page>
  );
}
