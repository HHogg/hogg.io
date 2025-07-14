import BitriseLogo from './assets/logos/bitrise.webp';
import BrandwatchLogo from './assets/logos/brandwatch.webp';
import FigmaLogo from './assets/logos/figma.webp';
import Pure360Logo from './assets/logos/pure360.webp';
import ReedsyLogo from './assets/logos/reedsy.webp';
import SpotifyLogo from './assets/logos/spotify.webp';
import { Data } from './types';

const data: Data = {
  placements: [
    {
      company: 'Figma',
      logo: FigmaLogo,
      date: '2025-03-24',
      role: 'Software Engineer',
      tags: ['backend', 'frontend', 'ruby', 'typescript', 'rust'],
    },
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
        "My time at Brandwatch was spent building the frontend to the [Audiences](https://www.brandwatch.com/products/influence/) product, leading the development of [Axiom](https://axiom.brandwatch.com/) (the company's component library and design system) and helping out with various other development projects including a data labeling tool for entity recognition.",
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
};

export default data;
