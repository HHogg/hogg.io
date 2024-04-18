import {
  Media,
  Project,
  ProjectPageProps,
  ProjectPageProvider,
  getProjectRoutePath,
} from '@hogg/common';
import { Box } from 'preshape';
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
        gap="x16"
      >
        <Header>
          <Box flex="vertical">
            <PageBackButton title="Home" path="/" />
          </Box>
        </Header>

        <Media lessThan="desktop">
          <Component layout="vertical" gap="x16" />
        </Media>

        <Media greaterThanOrEqual="desktop">
          <Component layout="horizontal" gap="x24" />
        </Media>

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
