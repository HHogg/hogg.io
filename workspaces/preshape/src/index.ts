import { type Project, ProjectKey } from '@hogg/common';
import imageDark from './preshape-dark.webp';
import image from './preshape.webp';

export const meta: Project = {
  id: ProjectKey._preshape,
  name: 'Preshape design system',
  image,
  imageDark,
  description:
    'A simple and flexible design system and library of React components and other utilities, that I maintain for my own personal projects.',
  href: 'https://preshape.hogg.io',
  tags: ['component library', 'css', 'design system', 'react', 'typescript'],
  deploy: true,
};
