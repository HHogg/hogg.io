// Import images from the common images folder
import circleArtImage from './images/circle-art.webp';
import circleIntersectionsImage from './images/circle-intersections.webp';
import circularSequenceImage from './images/circular-sequence.webp';
import lineSegmentExtendingImage from './images/line-segment-extending.webp';
import preshapeImage from './images/preshape.webp';
import snakeImage from './images/snake.webp';
import spiralsImage from './images/spirals.webp';
import tilingsValidationGapsImage from './images/tilings-validation-gaps.webp';
import tilingsImage from './images/tilings.webp';
import { type Project, ProjectKey } from './types';

export const circleArtMeta: Project = {
  id: ProjectKey.circle_art,
  name: 'Illustration app using only circle intersections',
  description:
    'Using a circle intersection graph to create a simple illustration app that can be used to create art from circles.',
  created: '2020-02-14',
  updated: '2024-03-16',
  image: circleArtImage,
  tags: ['data structures', 'geometry', 'react', 'svg', 'typescript'],
  deploy: true,
};

export const circleIntersectionsMeta: Project = {
  id: ProjectKey.circle_intersections,
  name: 'Circle intersections with graph data structures',
  image: circleIntersectionsImage,
  description:
    'Using circle intersection pairs and 5 simple rules to create a graph data structure that can be used to find all the intersection areas of circles.',
  tags: ['data structures', 'geometry', 'react', 'svg', 'typescript'],
  created: '2020-02-14',
  updated: '2024-03-16',
  deploy: true,
};

export const circularSequenceMeta: Project = {
  id: ProjectKey.circular_sequence,
  name: 'Matching symmetric circular sequences with Knuth-Morris-Pratt (KMP)',
  description:
    'Identifying and comparing unique geometric shape arrangements without a defined start or endpoint using the Knuth-Morris-Pratt algorithm in Rust.',
  image: circularSequenceImage,
  tags: ['algorithms', 'data structures', 'sequences', 'rust'],
  deploy: true,
  created: '2024-03-17',
  updated: '2024-04-10',
};

export const epigeneticsMeta: Project = {
  id: ProjectKey.epigenetics,
  name: 'Genes to Phenotype visualisation',
  description:
    'Representing the complexity of how genes are expressed in an organism as its phenotype.',
  tags: ['simulation', 'rust'],
  deploy: false,
  wip: true,
  created: '2099-12-12',
  updated: '2099-12-12',
};

export const grahamsScanMeta: Project = {
  id: ProjectKey.grahams_scan,
  name: 'Using Grahams Scan to scale a tiled plane to cover a rectangle',
  description:
    'Stuck with the problem on how to cover a rectangle with a tiled place, this article explains how to use Grahams Scan to identify the convex hull and scale it to cover the rectangle.',
  tags: ['algorithms', 'data structures', 'rust', 'grahams scan'],
  deploy: false,
  wip: true,
  created: '2099-12-12',
  updated: '2099-12-12',
};

export const lineSegmentExtendingMeta: Project = {
  id: ProjectKey.line_segment_extending,
  name: 'Extending a line segment to the edges of a bounded area',
  description:
    'Extending line segments to annotate transformation lines using Rust, focusing on mathematical concepts and line intersection techniques to accurately represent these transforms in a bounded area.',
  image: lineSegmentExtendingImage,
  tags: ['geometry', 'rust', 'canvas', 'wasm'],
  created: '2024-04-01',
  updated: '2024-04-01',
  deploy: true,
};

export const preshapeMeta: Project = {
  id: ProjectKey._preshape,
  name: 'Preshape design system',
  image: preshapeImage,
  description:
    'A simple and flexible design system and library of React components and other utilities, that I maintain for my own personal projects.',
  href: 'https://preshape.hogg.io',
  tags: ['component library', 'css', 'design system', 'react', 'typescript'],
  deploy: true,
  created: '2018-06-13',
  updated: '2024-03-17',
};

export const snakeMeta: Project = {
  id: ProjectKey.snake,
  name: 'Using heuristics for the optimal solution to the game of Snake',
  description:
    'Using a combination of A* and a heuristic function to produce the optimal solution for solving the classic game of snake.',
  image: snakeImage,
  tags: [
    'algorithms',
    'canvas',
    'css',
    'data structures',
    'heuristics',
    'react',
    'typescript',
  ],
  deploy: true,
  created: '2016-11-18',
  updated: '2024-03-17',
};

export const spatialGridMapMeta: Project = {
  id: ProjectKey.spatial_grid_map,
  name: 'Using a spatial grid map for efficient floating point lookup',
  description:
    'A method for subdividing a euclidean tiling plane into a grid of bits for quickly checking an area for the existence of polygon components and performing collision detection',
  tags: ['algorithms', 'data structures', 'rust'],
  deploy: false,
  wip: true,
  created: '2099-12-12',
  updated: '2099-12-12',
};

export const spiralsMeta: Project = {
  id: ProjectKey.spirals,
  name: 'Rendering spirals and radial patterns with particles in WebGL',
  image: spiralsImage,
  description:
    'A WebGL experiment to render and animate spirals and radial patterns with particles, involving some trigonometry and graphing equations.',
  tags: ['algorithms', 'geometry', 'react', 'typescript', 'webgl'],
  deploy: true,
  created: '2018-05-22',
  updated: '2024-03-17',
};

export const tilingsMeta: Project = {
  id: ProjectKey.tilings,
  image: tilingsImage,
  name: 'Searching, generating, validating and rendering lattice structures',
  description: `A long term project to generate Euclidean tilings by developing a notation to describe them, a structure generator, a validator and a renderer.`,
  wip: true,
  deploy: true,
  tags: [
    'data structures',
    'geometry',
    'react',
    'rust',
    'webassembly',
    'typescript',
    'actors',
  ],
  created: '2099-01-01',
  updated: '2099-01-01',
};

export const tilingsValidationGapsMeta: Project = {
  id: ProjectKey.tilings_validate_gaps,
  name: 'Detecting Gaps in Euclidean Tilings',
  description:
    'Short article explaining how to detect gaps in tilings using line segments to form complete circuits, in linear time.',
  image: tilingsValidationGapsImage,
  tags: ['algorithm', 'data structures', 'rust'],
  deploy: true,
  created: '2025-02-04',
  updated: '2025-02-04',
};

export const tilingsValidationOverlapsMeta: Project = {
  id: ProjectKey.tilings_validate_overlaps,
  name: 'Validating Overlaps in Euclidean Tilings',
  description: '...',
  tags: ['algorithm', 'data structures', 'rust'],
  deploy: false,
  wip: true,
  created: '2099-99-99',
  updated: '2099-99-99',
};

export const tilingsValidationVertexTypesMeta: Project = {
  id: ProjectKey.tilings_validate_vertex_types,
  name: 'Validating Vertex Types in Euclidean Tilings',
  description: '...',
  tags: ['algorithm', 'data structures', 'rust'],
  deploy: false,
  wip: true,
  created: '2099-99-99',
  updated: '2099-99-99',
};
