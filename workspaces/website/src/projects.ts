import * as CircleArt from '@hogg/circle-art';
import * as CircleIntersections from '@hogg/circle-intersections';
import * as CircularSequence from '@hogg/circular-sequence';
import { Project, ProjectKey, ProjectPageProps } from '@hogg/common';
import * as LineSegmentExtending from '@hogg/line-segment-extending';
import * as Preshape from '@hogg/preshape';
import * as Snake from '@hogg/snake';
import * as Spirals from '@hogg/spirals';
import * as Tilings from '@hogg/tilings';
import * as WasmApi from '@hogg/wasm-api';
import { ComponentType } from '@react-spring/web';

export const projects: {
  meta: Project;
  Component?: ComponentType<Pick<ProjectPageProps, 'layout'>>;
}[] = [
  {
    meta: CircleIntersections.meta,
    Component: CircleIntersections.Project,
  },
  {
    meta: CircleArt.meta,
    Component: CircleArt.Project,
  },
  {
    meta: Preshape.meta,
  },
  {
    meta: Snake.meta,
    Component: Snake.Project,
  },
  {
    meta: Spirals.meta,
    Component: Spirals.Project,
  },
  {
    meta: Tilings.meta,
    Component: Tilings.Project,
  },
  {
    meta: CircularSequence.meta,
    Component: CircularSequence.Project,
  },
  {
    meta: LineSegmentExtending.meta,
    Component: LineSegmentExtending.Project,
  },
  {
    meta: WasmApi.meta,
    Component: WasmApi.Project,
  },
  // Next: Performance benchmark difference between atan2 and hypot.
];

export const shouldShowProject = (project: Project) => {
  return !import.meta.env.PROD || project.deploy;
};

export const getNextProject = (id: ProjectKey): Project | undefined => {
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].meta.id === id) {
      for (let j = i + 1; j < projects.length; j++) {
        if (shouldShowProject(projects[j].meta) && !projects[j].meta.href) {
          return projects[j].meta;
        }
      }

      return;
    }
  }
};

export const getPreviousProject = (id: ProjectKey): Project | undefined => {
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].meta.id === id) {
      for (let j = i - 1; j >= 0; j--) {
        if (shouldShowProject(projects[j].meta) && !projects[j].meta.href) {
          return projects[j].meta;
        }
      }

      return;
    }
  }
};
