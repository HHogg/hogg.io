export enum ProjectKey {
  // External link projects start with an _
  _preshape = 'preshape',

  circle_art = 'circle-art',
  circle_intersections = 'circle-intersections',
  circular_sequence = 'circular-sequence',
  gap_validation = 'gap-validation',
  evolution = 'evolution',
  line_segment_extending = 'line-segment-extending',
  snake = 'snake',
  spatial_grid_map = 'spatial-grid-map',
  spirals = 'spirals',
  tilings = 'tilings',
  wasm = 'wasm',
}

export type Project = {
  id: ProjectKey;
  name: string;
  description: string;
  created: string;
  updated: string;
  image?: string;
  tags: string[];
  href?: string;
  deploy?: boolean;
  wip?: boolean;
};
