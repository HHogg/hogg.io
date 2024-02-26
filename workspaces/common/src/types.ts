export enum ProjectKey {
  // External link projects start with an _
  _preshape = 'preshape',

  circle_art = 'circle-art',
  circle_intersections = 'circle-intersections',
  circular_sequence = 'circular-sequence',
  line_segment_extending = 'line-segment-extending',
  snake = 'snake',
  spirals = 'spirals',
  tilings = 'tilings',
}

export type Project = {
  id: ProjectKey;
  name: string;
  description: string;
  href?: string;
  image: string;
  imageDark?: string;
  tags: string[];
  wip?: boolean;
};
