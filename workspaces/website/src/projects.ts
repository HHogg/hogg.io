import * as CircleArt from '@hogg/circle-art';
import * as CircleIntersections from '@hogg/circle-intersections';
import * as CircularSequence from '@hogg/circular-sequence';
import {
  Project,
  ProjectKey,
  ProjectPageProps,
  circleArtMeta,
  circleIntersectionsMeta,
  circularSequenceMeta,
  evolutionMeta,
  grahamsScanMeta,
  lineSegmentExtendingMeta,
  preshapeMeta,
  snakeMeta,
  spatialGridMapMeta,
  spiralsMeta,
  tilingsMeta,
  tilingsValidationGapsMeta,
  tilingsValidationOverlapsMeta,
  tilingsValidationVertexTypesMeta,
} from '@hogg/common';
import * as Evolution from '@hogg/evolution';
import * as GrahamsScan from '@hogg/grahams-scan';
import * as LineSegmentExtending from '@hogg/line-segment-extending';
import * as Snake from '@hogg/snake';
import * as SpatialGridMap from '@hogg/spatial-grid-map';
import * as Spirals from '@hogg/spirals';
import * as Tilings from '@hogg/tilings';
import * as TilingsValidationGaps from '@hogg/tilings-validation-gaps';
import * as TilingsValidationOverlaps from '@hogg/tilings-validation-overlaps';
import * as TilingsValidationVertexTypes from '@hogg/tilings-validation-vertex-types';
import { ComponentType } from '@react-spring/web';

export const projects: {
  meta: Project;
  Component?: ComponentType<Pick<ProjectPageProps, 'layout'>>;
}[] = [
  {
    meta: circleIntersectionsMeta,
    Component: CircleIntersections.Project,
  },
  {
    meta: circleArtMeta,
    Component: CircleArt.Project,
  },
  {
    meta: preshapeMeta,
  },
  {
    meta: snakeMeta,
    Component: Snake.Project,
  },
  {
    meta: spiralsMeta,
    Component: Spirals.Project,
  },
  {
    meta: tilingsMeta,
    Component: Tilings.Project,
  },
  {
    meta: circularSequenceMeta,
    Component: CircularSequence.Project,
  },
  {
    meta: lineSegmentExtendingMeta,
    Component: LineSegmentExtending.Project,
  },
  {
    meta: evolutionMeta,
    Component: Evolution.Project,
  },
  {
    meta: spatialGridMapMeta,
    Component: SpatialGridMap.Project,
  },
  {
    meta: tilingsValidationGapsMeta,
    Component: TilingsValidationGaps.Project,
  },
  {
    meta: tilingsValidationOverlapsMeta,
    Component: TilingsValidationOverlaps.Project,
  },
  {
    meta: tilingsValidationVertexTypesMeta,
    Component: TilingsValidationVertexTypes.Project,
  },
  {
    meta: grahamsScanMeta,
    Component: GrahamsScan.Project,
  },
];

projects.sort((a, b) => {
  if (a.meta.created === b.meta.created) {
    return a.meta.name.localeCompare(b.meta.name);
  }

  return a.meta.created > b.meta.created ? -1 : 1;
});

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
