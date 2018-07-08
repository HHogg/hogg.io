const BirthdayParadox = {
  code: 'Bi',
  name: 'Birthday Paradox',
  to: '/projects/birthday-paradox',
  description: 'Experiment to visualise the [Birthday Paradox](https://en.wikipedia.org/wiki/Birthday_problem).',
  year: 2018,
};

const Brandwatch = {
  code: 'Br',
  name: 'Brandwatch',
  to: '/timeline/#Br',
  labels: ['javascript', 'nodejs', 'css', 'react', 'redux'],
  description: '**Senior Developer** - Brandwatch audience insights and targeted marketing',
  timeline: `[Brandwatch](https://brandwatch.com) is a social media monitoring platform. They provide tools to monitor, analyse and engage with conversations across the internet.

  My time at Brandwatch is spent building the frontend to the [Audiences](https://brandwatch.com/audiences) product, leading the development of [Axiom](https://axiom.brandwatch.com) (the company's Pattern Library and Design System) and helping out with various development projects.`,
  year: 2015,
};

const LockPick = {
  code: 'Lp',
  name: 'Lock Pick',
  to: '/projects/lock-pick',
  description: 'Experiment to create a Fallout style lock picking simulator.',
  year: 2018,
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

const CoSine = {
  code: 'Cs',
  name: 'CoSine',
  to: '/projects/cosine',
  labels: [],
  description: 'A simple and *unoriginal* visualisation to show the relationship between sine and cosine.',
  year: 2018,
};


export default [{
  ...Pure360, x: 1, y: 1,
}, {
  ...Reedsy, x: 1, y: 2,
}, {
  ...Brandwatch, x: 1, y: 3,
}, {
  ...SysPlot, x: 2, y: 2,
}, {
  ...RemarkableReact, x: 2, y: 3,
}, {
  ...Preshape, x: 3, y: 3,
}, {
  ...SnakeHeuristics, x: 4, y: 2,
}, {
  ...BirthdayParadox, x: 4, y: 3,
}, {
  ...LightRay, x: 5, y: 1,
}, {
  ...CoSine, x: 5, y: 2,
}, {
  ...LockPick, x: 5, y: 3,
}]

.sort((a, b) => a.y - b.y || a.x - b.x)
.map((_, number) => ({ ..._, number: number + 1 }));
