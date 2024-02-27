import { type Project, ProjectKey } from '@hogg/common';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.wasm_api,
  name: 'Setting up a reusable Wasm API for React projects',
  image: '',
  imageDark: '',
  description: '',
  tags: ['rust', 'react', 'wasm'],
};
