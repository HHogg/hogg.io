export enum ProjectKey {
  CircleArt = 'circle_art',
  CircleIntersectionsWithGraphs = 'circle_intersections_with_graphs',
  EuclideanTilings = 'euclidean_tilings',
  Preshape = 'preshape',
  SnakeOptimalSolution = 'snake_optimal_solution',
  Spirals = 'spirals',
}

export type Placement = {
  company: string;
  logo: string;
  date: string;
  description: string;
  tags: string[];
  role: string;
};

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

export type Data = {
  placements: Placement[];
  projects: Project[];
};
