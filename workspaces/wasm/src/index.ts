import { type Project, ProjectKey } from '@hogg/common';
import image from './image.webp';

export { useWasmApi } from './WasmApi/useWasmApi';
export { default as WasmApiLoadingScreen } from './WasmApi/WasmApiLoadingScreen';
export { default as WasmApiProvider } from './WasmApi/WasmApiProvider';
export { default as WasmWorkerLabel } from './WasmWorker/WasmWorkerLabel';

export * from './types';

export const meta: Project = {
  id: ProjectKey.wasm,
  name: 'Using rust in the browser',
  description: '',
  image,
  tags: ['rust', 'wasm'],
  created: '2024-09-08',
  updated: '2024-09-08',
  wip: true,
};
