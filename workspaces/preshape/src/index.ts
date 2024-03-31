import { type Project, ProjectKey } from '@hogg/common';
import image from './preshape.webp';

export const meta: Project = {
  id: ProjectKey._preshape,
  name: 'Preshape design system',
  image,
  description:
    'A simple and flexible design system and library of React components and other utilities, that I maintain for my own personal projects.',
  href: 'https://preshape.hogg.io',
  tags: ['component library', 'css', 'design system', 'react', 'typescript'],
  deploy: true,
  created: '2018-05-22',
  updated: '2024-03-17',
};
