import TilingGenerationPage from './TilingGenerationPage';
import TilingLibraryPage from './TilingLibraryPage';

export { default as Project } from './Project';
export { default as TilingRenderer } from './TilingRenderer';

export const routes = [
  {
    path: '/generate',
    Component: TilingGenerationPage,
  },
  {
    path: '/library',
    Component: TilingLibraryPage,
  },
];
