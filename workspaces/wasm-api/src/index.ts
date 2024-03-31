import { type Project, ProjectKey } from '@hogg/common';
import image from './image.webp';

export { default as Project } from './Project';

export const meta: Project = {
  id: ProjectKey.wasm_api,
  name: 'Workflow for a monorepo with Rust, WebAssembly, TypeScript and React',
  image,
  description: '',
  tags: ['rust', 'wasm', 'yarn', 'vite', 'typescript', 'react'],
};
