import {
  type Project,
  Media,
  ProjectPageWIP,
  ProjectPageProps,
  ProjectPageProvider,
  getProjectRoutePath,
} from '@hogg/common';
import { ComponentType, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Page from '../../components/Page/Page';
import PageBackButton from '../../components/Page/PageBackButton';
import PageChangeButtons from '../../components/Page/PageChangeButtons';
import {
  getNextProject,
  getPreviousProject,
  shouldShowProject,
} from '../../projects';

type Props = {
  Component: ComponentType<ProjectPageProps>;
  meta: Project;
};

export default function Project({ Component, meta }: Props) {
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
        image={meta.image}
        createdAt={meta.created}
        updatedAt={meta.updated}
        gap="x16"
      >
        <Header alignChildrenVertical="middle">
          <PageBackButton title="Home" path="/" />
        </Header>

        {shouldShowProject(meta) ? (
          <>
            <Media lessThan="desktop">
              <Component layout="vertical" gap="x16" />
            </Media>

            <Media greaterThanOrEqual="desktop">
              <Component layout="horizontal" gap="x24" />
            </Media>
          </>
        ) : (
          <ProjectPageWIP />
        )}

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
