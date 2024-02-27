import {
  Project,
  ProjectPageProps,
  ProjectPageProvider,
  getProjectRoutePath,
} from '@hogg/common';
import { useMatchMedia } from 'preshape';
import { ComponentType, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Page from '../../components/Page/Page';
import PageBackButton from '../../components/Page/PageBackButton';
import PageChangeButtons from '../../components/Page/PageChangeButtons';
import { getNextProject, getPreviousProject } from '../../projects';

export type Props = {
  Component: ComponentType<ProjectPageProps>;
  meta: Project;
};

export default function Project({ Component, meta }: Props) {
  const match = useMatchMedia(['1000px']);
  const previousProject = getPreviousProject(meta.id);
  const nextProject = getNextProject(meta.id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ProjectPageProvider project={meta}>
      <Page
        title={meta.name}
        description={meta.description}
        gap={match('1000px') ? 'x24' : 'x16'}
      >
        <Header>
          <PageBackButton title="Home" path="/" />
        </Header>

        <Component
          layout={match('1000px') ? 'horizontal' : 'vertical'}
          gap={match('1000px') ? 'x24' : 'x8'}
        />

        <PageChangeButtons
          previous={
            previousProject && {
              title: previousProject.name,
              description: previousProject.description,
              to: getProjectRoutePath(previousProject),
            }
          }
          next={
            nextProject && {
              title: nextProject.name,
              description: nextProject.description,
              to: getProjectRoutePath(nextProject),
            }
          }
        />
      </Page>
    </ProjectPageProvider>
  );
}
