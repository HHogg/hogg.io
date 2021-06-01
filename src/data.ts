import { Data } from './Types';

const data: Data = {
  experience: {
    'Pure360': {
      'company': 'Pure360',
      'date': '2014-04-01',
      'description': 'Pure360 is an Email Service Provider (ESP) offering a Software-as-a-service platform that allows businesses to manage their subscribers, create emails and track campaigns. My time at Pure360 as a UI Developer was primarily focused on building the UI to their Drag and Drop email creation tool and helped build the platform for campaign management and analytics.',
      'tags': ['javascript', 'nodejs', 'scala', 'angular', 'less'],
      'role': 'UI Developer',
    },
    'Reedsy': {
      'company': 'Reedsy',
      'date': '2015-04-01',
      'description': 'Reedsy is a curated marketplace for self publishing authors. They provide a platform to handle connections, communication and payments between authors and professionals, and a suite of tools to write and publish books. My time at Reedsy was spent building the marketplace to connect book publishing professionals, the real-time collaborative book editing application (using Operational Transformation), and the Pattern Library to implement the design system across these two application.',
      'tags': ['javascript', 'nodejs', 'ruby', 'angular', 'sass'],
      'role': 'Senior Developer',
    },
    'Brandwatch': {
      'company': 'Brandwatch',
      'date': '2015-11-01',
      'description': 'Brandwatch is a social media monitoring platform. They provide tools to monitor, analyse and engage with conversations across the internet. My time at Brandwatch was spent building the frontend to the Audiences (Twitter advertising) product, leading the development of Axiom (the company\'s Pattern Library and Design System) and helping out with various other development projects.',
      'tags': ['javascript', 'nodejs', 'css', 'react', 'redux'],
      'role': 'Senior Developer',
    },
    'Bitrise': {
      'company': 'Bitrise & Outlyer (Acquisition)',
      'date': '2018-10-01',
      'description': 'Bitrise is a continuous integration and delivery platform built for mobile. My time at Bitrise is focused on building and leading the Trace product which is a mobile application performance monitoring tool, that collects metrics, traces and crashes from user mobile devices and aggregates this data to help developers analyse and identify problems in their apps.',
      'tags': ['typescript', 'css', 'react'],
      'role': 'Tech Lead',
    },
  },

  projects: {
    'Planet': {
      'description': '',
      'image': require('./assets/rorschach.png'),
      'imageOG': require('./assets/rorschach.png'),
      'tags': ['typescript', 'react', 'regl'],
      'title': 'Planet',
      'to': '/projects/planet',
    },
    'Circles': {
      'description': 'A web application for creating artwork by filling in the intersection areas of overlapping circles. Using an experimental way of calculating intersections areas with computational geometry.',
      'href': 'https://circles.hogg.io',
      'image': require('./assets/circles.svg'),
      'tags': ['typescript', 'react', 'geometry'],
      'title': 'Circles',
    },
    'Antwerp': {
      'description': 'A web application for visualising the GomJau-Hogg notation for generating any regular polygon tessellations.',
      'href': 'https://antwerp.hogg.io',
      'image': require('./assets/antwerp.svg'),
      'tags': ['typescript', 'react', 'geometry'],
      'title': 'Antwerp',
    },
    'Preshape': {
      'description': 'A minimal design system and library of React components, that fit together just like LEGO. This exists mainly to facilitate my own personal projects.',
      'href': 'https://preshape.hogg.io',
      'image': require('./assets/preshape.svg'),
      'tags': ['typescript', 'react', 'css'],
      'title': 'Preshape',
    },
    'Snake': {
      'description': 'Snake Heuristics is a game for developers to write a heuristic function, to play the perfect classic game of snake. This was created for a workshop at the AsyncJS meetup.',
      'href': 'https://snake.hogg.io',
      'image': require('./assets/snake.svg'),
      'tags': ['javascript', 'react', 'css'],
      'title': 'Snake',
    },
    'Spirals': {
      'description': 'An experiment for rendering and animating a variety of spirals and radial patterns using WebGL.',
      'image': require('./assets/spiral.png'),
      'imageOG': require('./assets/spiral.png'),
      'tags': ['typescript', 'react', 'webgl'],
      'title': 'Spirals',
      'to': '/projects/spirals',
    },
  },

  writings: {
    'CircleIntersections': {
      'date': '2018-08-17',
      'description': 'An experiment into calculating all of the regions of intersecting circles using a computational geometric algorithm.',
      'imageOG': require('./assets/circles.png'),
      'title': 'Identifying the areas of intersecting circles with computational geometry',
      'to': '/writings/circle-intersections',
    },
    'GeneratingTessellations': {
      'date': '2020-01-31',
      'description': 'An explanation of the GomJau-Hogg’s notation for generating all of the regular, semiregular (uniform) and demigular (k-uniform, up to at least k=3) in a consistent, unique and unequivocal manner.',
      'imageOG': require('./assets/antwerp.png'),
      'title': 'GomJau-Hogg’s notation for automatic generation of k-uniform tessellations',
      'to': '/writings/generating-tessellations',
    },
    'SnakeSolution': {
      'date': '2020-04-13',
      'description': 'An exploration into finding the most optimal programmatic solution for completing the classic game of snake.',
      'imageOG': require('./assets/snake.png'),
      'title': 'Finding the optimal solution for solving the classic game of Snake with pathfinding and heuristics',
      'to': '/writings/snake-solution',
    },
  },
};

export default data;
