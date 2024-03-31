import { getProjectRoutePath } from '@hogg/common';
import { ThemeProvider } from 'preshape';
import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Route, Routes } from 'react-router-dom';
import Page404 from './pages/404';
import Landing from './pages/Landing/Landing';
import ProjectPage from './pages/Project/Project';
import { projects, shouldShowProject } from './projects';
import 'preshape/dist/style.css';

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme="night" disableSystemTheme>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/">
              <Route index element={<Landing />} />

              {projects
                .filter(
                  ({ Component, meta }) => Component && shouldShowProject(meta)
                )
                .map(({ Component, meta }) => (
                  <Route
                    key={meta.id}
                    path={getProjectRoutePath(meta)}
                    element={<ProjectPage Component={Component!} meta={meta} />}
                  />
                ))}
            </Route>

            <Route path="*" element={<Page404 />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </HelmetProvider>
  );
}
