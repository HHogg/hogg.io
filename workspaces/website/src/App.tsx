import { getProjectRoutePath } from '@hogg/common';
import { ThemeProvider } from 'preshape';
import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import ProjectPage from './pages/Project/Project';
import { projects } from './projects';
import 'preshape/dist/style.css';
import './App.css';

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme="night">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/">
              <Route index element={<Landing />} />

              {projects
                .filter(({ Component }) => Component)
                .map(({ Component, meta }) => (
                  <Route
                    key={meta.id}
                    path={getProjectRoutePath(meta)}
                    element={<ProjectPage Component={Component!} meta={meta} />}
                  />
                ))}
            </Route>
          </Routes>
        </Suspense>
      </ThemeProvider>
    </HelmetProvider>
  );
}
