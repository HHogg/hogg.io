import keyBy from 'lodash/keyBy';
import BitriseLogo from './assets/logos/bitrise.webp';
import BrandwatchLogo from './assets/logos/brandwatch.webp';
import Pure360Logo from './assets/logos/pure360.webp';
import ReedsyLogo from './assets/logos/reedsy.webp';
import SpotifyLogo from './assets/logos/spotify.webp';
import CircleArtDarkImage from './assets/projects/circle-art-dark.webp';
import CircleArtImage from './assets/projects/circle-art.webp';
import CircleGraphDarkImage from './assets/projects/circle-graph-dark.webp';
import CircleGraphImage from './assets/projects/circle-graph.webp';
import EuclideanTilingsImage from './assets/projects/euclidean-tilings.webp';
import PreshapeDarkImage from './assets/projects/preshape-dark.webp';
import PreshapeImage from './assets/projects/preshape.webp';
import SnakeDarkImage from './assets/projects/snake-dark.webp';
import SnakeImage from './assets/projects/snake.webp';
import SpiralsDarkImage from './assets/projects/spirals-dark.webp';
import SpiralsImage from './assets/projects/spirals.webp';
import { Data, Project, ProjectKey } from './types';

const data: Data = {
  placements: [
    {
      company: 'Spotify',
      logo: SpotifyLogo,
      date: '2021-08-30',
      description:
        'My time at Spotify has been spent working on a variety of projects, including Scio data pipelines, Apollo and GRPC Java backends, engineering tooling, and most recently I lead the work stream of bringing [AI translated podcasts](https://newsroom.spotify.com/2023-09-25/ai-voice-translation-pilot-lex-fridman-dax-shepard-steven-bartlett/) to the desktop and web player.',
      role: 'Senior Engineer',
      tags: [
        'backend',
        'data',
        'desktop',
        'frontend',
        'gcp',
        'java',
        'grpc',
        'nodejs',
        'react',
        'scala',
        'scio',
        'typescript',
      ],
    },
    {
      company: 'Bitrise & Outlyer (Acquisition)',
      logo: BitriseLogo,
      date: '2018-10-01',
      description:
        'My time at Bitrise was focused on building and leading a [performance monitoring platform](https://www.youtube.com/watch?v=3PlYVZ48vzk) for mobile applications that collects, aggregates and presents metrics and crashes. I also lead the design system project that was used across a variety of applications and websites.',
      tags: [
        'css',
        'data visualisations',
        'design system',
        'gcp',
        'nodejs',
        'react',
        'typescript',
        'webgl',
      ],
      role: 'Tech Lead',
    },
    {
      company: 'Brandwatch',
      logo: BrandwatchLogo,
      date: '2015-11-01',
      description:
        "My time at Brandwatch was spent building the frontend to the [Audiences](https://www.brandwatch.com/products/audiences/content-marketing/) (Twitter advertising) product, leading the development of [Axiom](https://axiom.brandwatch.com/) (the company's component library and design system) and helping out with various other development projects including a data labeling tool for entity recognition.",
      tags: [
        'css',
        'design system',
        'gcp',
        'javascript',
        'nodejs',
        'react',
        'redux',
      ],
      role: 'Senior Developer',
    },
    {
      company: 'Reedsy',
      logo: ReedsyLogo,
      date: '2015-04-01',
      description:
        'My time at Reedsy was spent building the [marketplace](https://reedsy.com/) to connect book publishing professionals, the [real-time collaborative book editing application](https://reedsy.com/write-a-book) (using Operational Transformation), and leading the component library project to implement the design system across these two application.',
      tags: [
        'angular',
        'aws',
        'backend',
        'design system',
        'frontend',
        'javascript',
        'nodejs',
        'realtime collaboration',
        'ruby',
        'sass',
      ],
      role: 'Senior Developer',
    },
    {
      company: 'Pure360',
      logo: Pure360Logo,
      date: '2014-04-01',
      description:
        'My time at Pure360 as a UI Developer was focused on building a drag and drop email editor and the platform for campaign management and analytics.',
      tags: [
        'angular',
        'design system',
        'javascript',
        'less',
        'nodejs',
        'scala',
      ],
      role: 'UI Developer',
    },
  ],
  projects: [
    {
      id: ProjectKey.CircleIntersectionsWithGraphs,
      name: 'Circle intersections with graph data structures',
      image: CircleGraphImage,
      imageDark: CircleGraphDarkImage,
      description:
        'Using circle intersection pairs and 5 simple rules to create a graph data structure that can be used to find all the intersection areas of circles.',
      tags: ['data structures', 'geometry', 'react', 'svg', 'typescript'],
    },
    {
      id: ProjectKey.CircleArt,
      name: 'Illustration app using only circle intersections',
      image: CircleArtImage,
      imageDark: CircleArtDarkImage,
      description:
        'Using a circle intersection graph to create a simple illustration app that can be used to create art from circles.',
      tags: ['data structures', 'geometry', 'react', 'svg', 'typescript'],
    },
    {
      id: ProjectKey.Preshape,
      name: 'Preshape design system',
      image: PreshapeImage,
      imageDark: PreshapeDarkImage,
      description:
        'A simple and flexible design system and library of React components and other utilities, that I maintain for my own personal projects.',
      href: 'https://preshape.hogg.io',
      tags: [
        'component library',
        'css',
        'design system',
        'react',
        'typescript',
      ],
    },
    {
      id: ProjectKey.SnakeOptimalSolution,
      name: 'Using heuristics for the optimal solution to the game of Snake',
      image: SnakeImage,
      imageDark: SnakeDarkImage,
      description:
        'Using a combination of A* and a heuristic function to produce the optimal solution for solving the classic game of snake.',
      tags: [
        'algorithms',
        'canvas',
        'css',
        'data structures',
        'heuristics',
        'react',
        'typescript',
      ],
    },
    {
      id: ProjectKey.Spirals,
      name: 'Rendering and animating particles into spirals and radial patterns',
      image: SpiralsImage,
      imageDark: SpiralsDarkImage,
      description:
        'A WebGL experiment to render and animate spirals and radial patterns with particles, involving some trigonometry and graphing equations.',
      tags: ['algorithms', 'geometry', 'react', 'typescript', 'webgl'],
    },

    {
      id: ProjectKey.EuclideanTilings,
      name: 'Searching and rendering Euclidean tilings with Rust and a multithreaded actor architecture',
      description:
        'Developing a notation used to reference unique regular polygon tilings, a searching algorithm to discover them and a renderer to display them for the web.',
      image: EuclideanTilingsImage,
      wip: true,
      tags: [
        'data structures',
        'geometry',
        'react',
        'rust',
        'webassembly',
        'typescript',
        'actors',
      ],
    },
  ],
};

export const projectsByKey = keyBy(data.projects, 'id') as Record<
  ProjectKey,
  Project
>;

export const getNextProject = (id: ProjectKey): Project | undefined => {
  const index = data.projects.findIndex((project) => project.id === id);

  if (data.projects[index + 1]?.href) {
    return getNextProject(data.projects[index + 1].id);
  }

  return data.projects[index + 1];
};

export const getPreviousProject = (id: ProjectKey): Project | undefined => {
  const index = data.projects.findIndex((project) => project.id === id);

  if (data.projects[index - 1]?.href) {
    return getPreviousProject(data.projects[index - 1].id);
  }

  return data.projects[index - 1];
};

export default data;
