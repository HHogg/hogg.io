import { Data } from './types';

const data: Data<
  'Pure360' | 'Reedsy' | 'Brandwatch' | 'Bitrise' | 'Spotify',
  'CircleGraph' | 'Circles' | 'Antwerp' | 'Preshape' | 'Snake' | 'Spirals',
  | 'CircleGraphs'
  | 'CircleIntersections'
  | 'GeneratingTessellations'
  | 'SnakeSolution'
> = {
  experience: {
    Pure360: {
      company: 'Pure360',
      date: '2014-04-01',
      description:
        'Pure360 is an Email Service Provider (ESP) offering a Software-as-a-service platform that allows businesses to manage their subscribers, create emails and track campaigns. My time at Pure360 as a UI Developer was primarily focused on building the UI to their Drag and Drop email creation tool and helped build the platform for campaign management and analytics.',
      tags: ['javascript', 'nodejs', 'scala', 'angular', 'less'],
      role: 'UI Developer',
    },
    Reedsy: {
      company: 'Reedsy',
      date: '2015-04-01',
      description:
        'Reedsy is a curated marketplace for self publishing authors. They provide a platform to handle connections, communication and payments between authors and professionals, and a suite of tools to write and publish books. My time at Reedsy was spent building the marketplace to connect book publishing professionals, the real-time collaborative book editing application (using Operational Transformation), and the Pattern Library to implement the design system across these two application.',
      tags: ['javascript', 'nodejs', 'ruby', 'angular', 'sass', 'aws'],
      role: 'Senior Developer',
    },
    Brandwatch: {
      company: 'Brandwatch',
      date: '2015-11-01',
      description:
        "Brandwatch is a social media monitoring platform. They provide tools to monitor, analyse and engage with conversations across the internet. My time at Brandwatch was spent building the frontend to the Audiences (Twitter advertising) product, leading the development of Axiom (the company's Pattern Library and Design System) and helping out with various other development projects.",
      tags: ['javascript', 'nodejs', 'css', 'react', 'redux', 'gcp'],
      role: 'Senior Developer',
    },
    Bitrise: {
      company: 'Bitrise & Outlyer (Acquisition)',
      date: '2018-10-01',
      description:
        'Bitrise is a continuous integration and delivery platform built for mobile. My time at Bitrise was focused on building and tech leading the Trace product which is a mobile application performance monitoring tool, that collects metrics, traces and crashes from user mobile devices and aggregates this data to help developers analyse and identify problems in their apps.',
      tags: ['typescript', 'css', 'react', 'gcp'],
      role: 'Tech Lead',
    },
    Spotify: {
      company: 'Spotify',
      date: '2021-08-30',
      role: 'Senior Engineer',
    },
  },

  projects: {
    CircleGraph: {
      description:
        'An application, for describing and visualising an algorithm that calculates circle intersections with graphs.',
      image: require('./assets/circle-graph.png'),
      imageOG: require('./assets/circle-graph.png'),
      tags: ['typescript', 'react', 'geometry', 'svg'],
      title: 'Circle Graph',
      to: '/projects/circle-graph',
    },
    Circles: {
      description:
        'A web application for creating artwork by filling in the intersection areas of overlapping circles. Using an experimental way of calculating intersections areas with graphs.',
      href: 'https://circles.hogg.io',
      image: require('./assets/circles.svg'),
      tags: ['typescript', 'react', 'geometry'],
      title: 'Circles',
    },
    Antwerp: {
      description:
        'A web application for visualising the GomJau-Hogg notation for generating any regular polygon tessellations.',
      href: 'https://antwerp.hogg.io',
      image: require('./assets/antwerp.svg'),
      tags: ['typescript', 'react', 'geometry'],
      title: 'Antwerp',
    },
    Preshape: {
      description:
        'A minimal design system and library of React components, that fit together just like LEGO. This exists mainly to facilitate my own personal projects.',
      href: 'https://preshape.hogg.io',
      image: require('./assets/preshape.svg'),
      tags: ['typescript', 'react', 'css'],
      title: 'Preshape',
    },
    Snake: {
      description:
        'Snake Heuristics is a game for developers to write a heuristic function, to play the perfect classic game of snake. This was created for a workshop at the AsyncJS meetup.',
      href: 'https://snake.hogg.io',
      image: require('./assets/snake.svg'),
      tags: ['javascript', 'react', 'css'],
      title: 'Snake',
    },
    Spirals: {
      description:
        'An experiment for rendering and animating a variety of spirals and radial patterns using WebGL.',
      image: require('./assets/spiral.png'),
      imageOG: require('./assets/spiral.png'),
      tags: ['typescript', 'react', 'webgl'],
      title: 'Spirals',
      to: '/projects/spirals',
    },
  },

  writings: {
    CircleGraphs: {
      id: 'CircleGraphs',
      date: '2021-08-19',
      description:
        'An explanation in using graphs to find intersections of geometry by conditionally and dynamically creating connections that follow a set of rules.',
      imageOG: require('./assets/circles.png'),
      tags: [
        'svg',
        'visualisation',
        'geometry',
        'data structures',
        'graphs',
        'bitset',
      ],
      title: 'Finding circle intersections with graphs',
      to: '/writings/circle-graphs',
    },
    CircleIntersections: {
      id: 'CircleIntersections',
      date: '2018-08-17',
      description:
        'An experiment into calculating all of the regions of intersecting circles using a computational geometric algorithm.',
      imageOG: require('./assets/circles.png'),
      tags: [
        'svg',
        'visualisation',
        'geometry',
        'data structures',
        'graphs',
        'bitset',
      ],
      title:
        'Identifying the areas of intersecting circles with computational geometry',
      to: '/writings/circle-intersections',
      unlisted: true,
    },
    GeneratingTessellations: {
      id: 'GeneratingTessellations',
      date: '2020-01-31',
      description:
        'An explanation of the GomJau-Hogg’s notation for generating all of the regular, semiregular (uniform) and demigular (k-uniform, up to at least k=3) in a consistent, unique and unequivocal manner.',
      imageOG: require('./assets/antwerp.png'),
      tags: [
        'svg',
        'visualisation',
        'geometry',
        'tessellations',
        'nomenclature',
      ],
      title:
        'GomJau-Hogg’s notation for automatic generation of k-uniform tessellations',
      to: '/writings/generating-tessellations',
    },
    SnakeSolution: {
      id: 'SnakeSolution',
      date: '2020-04-13',
      description:
        'An exploration into finding the most optimal programmatic solution for completing the classic game of snake.',
      imageOG: require('./assets/snake.png'),
      tags: [
        'svg',
        'visualisation',
        'data structures',
        'pathfinding',
        'heuristics',
        'game',
      ],
      title:
        'Finding the optimal solution for solving the classic game of Snake with pathfinding and heuristics',
      to: '/writings/snake-solution',
    },
  },
};

export const listedWritingsSorted = Object.values(data.writings)
  .filter((a) => !a.unlisted)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const experienceSorted = Object.values(data.experience).sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export default data;
