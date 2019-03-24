// const BirthdayParadox = {
//   code: 'Bi',
//   name: 'Birthday Paradox',
//   to: '/projects/birthday-paradox',
//   description: 'Experiment to visualise the [Birthday Paradox](https://en.wikipedia.org/wiki/Birthday_problem).',
//   year: 2018,
// };

const Bitrise = {
  code: 'Br',
  name: 'Bitrise',
  to: '/timeline/#Br',
  labels: ['javascript', 'css', 'react', 'redux'],
  description: '**Senior Developer** - CI/CD for mobile apps **([Outlyer acquisition](https://blog.bitrise.io/bitrise-acquires-outlyer))**',
  timeline: true,
  year: 2019,
};

const Brandwatch = {
  code: 'Bw',
  name: 'Brandwatch',
  to: '/timeline/#Bw',
  labels: ['javascript', 'nodejs', 'css', 'react', 'redux'],
  description: '**Senior Developer** - Brandwatch audience insights and targeted marketing',
  timeline: `[Brandwatch](https://brandwatch.com) is a social media monitoring platform. They provide tools to monitor, analyse and engage with conversations across the internet.

  My time at Brandwatch was spent building the frontend to the [Audiences](https://brandwatch.com/audiences) product, leading the development of [Axiom](https://axiom.brandwatch.com) (the company's Pattern Library and Design System) and helping out with various development projects.`,
  year: 2015,
};

const CircleArt = {
  code: 'Ca',
  name: 'Circle Art',
  to: '/projects/circle-art',
  description: 'A tool for creating artwork by only drawing circles and filling in the intersecting regions. Inspired by a [Reddit post](https://www.reddit.com/r/Damnthatsinteresting/comments/963j4n/magic_of_circles) and [13 Animals Made From 13 Circles](http://dorotapankowska.com/13-animals-13-circles.html) by Dorota Pankowska.',
  year: 2018,
};

const CoSine = {
  code: 'Cs',
  name: 'CoSine',
  to: '/projects/cosine',
  description: 'A simple and *unoriginal* visualisation to show the relationship between sine and cosine.',
  year: 2018,
};

const EuclideanTiling = {
  code: 'Et',
  name: 'Euclidean Tiling',
  to: '/projects/euclidean-tiling',
  description: 'Systematic generation of regular polygon tessellations using an expressive notation.',
  year: 2019,
};

const LightRay = {
  code: 'Lr',
  name: 'Light Ray',
  to: '/projects/light-ray',
  description: 'Experiment to explore shape intersections to replicate light rays and shadow effects.',
  year: 2017,
};

const Preshape = {
  code: 'Pr',
  name: 'Preshape',
  href: 'https://preshape.hogg.io',
};

const Pure360 = {
  code: 'Pu',
  name: 'Pure360',
  to: '/timeline',
  labels: ['javascript', 'nodejs', 'scala', 'angular', 'less'],
  description: '**UI Developer** - Email & SMS marketing provider',
  timeline: `[Pure360](https://pure360.com/) is an Email Service Provider (ESP) offering a Software-as-a-service platform that allows businesses to manage their subscribers, create emails and track campaigns.

  My time at Pure360 as a UI Developer was primarily focused on building the UI to their Drag and Drop email creation tool and helped build the platform for campaign management and tracking.`,
  year: 2014,
};

const Outlyer = {
  code: 'Ou',
  name: 'Outlyer',
  to: '/timeline/#Ou',
  labels: ['javascript', 'nodejs', 'css', 'react', 'redux', 'webgl', 'd3'],
  description: '**Senior Developer** - Infrastructure Monitoring',
  timeline: `[Outlyer](https://www.outlyer.com/) is a self-service monitoring plaform for teams, giving them deep visibility into infrastructure and custom metrics at scale.

  At Outlyer my focus is building the frontend, which using yarn workspaces, has been separated into focused and connectable applications. Some of these include a bespoke visualisation built with WebGL to view the status of hosts, containers and devices. Another is a custom design system and React component library to accelerate development and provide UI consistency.`,
  year: 2018,
};

const Reedsy = {
  code: 'Re',
  name: 'Reedsy',
  to: '/timeline/#Re',
  labels: ['javascript', 'nodejs', 'ruby', 'angular', 'sass'],
  description: '**Senior Developer** - Self publishing platform',
  timeline: `[Reedsy](https://reedsy.com) is a curated marketplace for self publishing authors. They provide a platform to handle connections, communication and payments between authors and professionals, and a suite of tools to write and publish books.

  My time at Reedsy was spent building the marketplace to connect book publishing professionals, the collaborative book editing application (harnessing the [Operational Transformation](https://operational-transformation.github.io/) technology), and the Pattern Library to implement the design system across these two application.`,
  year: 2015,
};

const RemarkableReact = {
  code: 'Rm',
  name: 'Remarkable React',
  to: '/projects/remarkable-react',
  github: 'https://github.com/HHogg/remarkable-react',
  description: 'A React renderer for the [remarkable](https://jonschlinkert.github.io/remarkable/demo/) markdown parsing library.',
  year: 2016,
};

const SysPlot = {
  code: 'Sp',
  name: 'SysPlot',
  to: '/projects/sysplot',
  github: 'https://github.com/HHogg/sysplot',
  description: 'A library that systematically generates a plane for plotting shapes, with a variety of algorithms to choose from.',
  year: 2018,
};

const SnakeHeuristics = {
  code: 'Sn',
  name: 'Snake Heuristics',
  href: 'https://snake.hogg.io',
};

export default [
  { ...Pure360, x: 1, y: 1 },
  { ...Reedsy, x: 1, y: 2 },
  { ...Outlyer, x: 1, y: 3 },
  { ...Bitrise, x: 1, y: 4 },
  { ...Brandwatch, x: 2, y: 2 },
  { ...SysPlot, x: 2, y: 3 },
  { ...RemarkableReact, x: 2, y: 4 },
  { ...Preshape, x: 3, y: 4 },
  { ...CoSine, x: 4, y: 3 },
  { ...LightRay, x: 4, y: 4 },
  { ...SnakeHeuristics, x: 5, y: 2 },
  { ...CircleArt, x: 5, y: 3 },
  { ...EuclideanTiling, x: 5, y: 4 },
]

.sort((a, b) => a.y - b.y || a.x - b.x)
.map((_, number) => ({ ..._, number: number + 1 }));
