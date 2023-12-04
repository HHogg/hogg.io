import { ThemeProvider } from 'preshape';
import { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Route, Routes } from 'react-router-dom';

import 'preshape/dist/style.css';
import './App.css';
import CircleArt from './pages/CirclArt';
import { ProjectKey } from './types';

// prettier-ignore
const CircleIntersectionsWithGraphs = lazy(() => import('./pages/CircleIntersectionsWithGraphs'));
const EuclideanTilings = lazy(() => import('./pages/EuclideanTilings'));
// prettier-ignore
const EuclideanTilingsGenerate = lazy(() => import('./pages/EuclideanTilings/Generate'));
const Landing = lazy(() => import('./pages/Landing/Landing'));
const SnakeOptimalSolution = lazy(() => import('./pages/SnakeOptimalSolution'));
const Spirals = lazy(() => import('./pages/Spirals'));

// prettier-ignore
export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme="night">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/">
              <Route index element={<Landing />} />
              <Route element={<CircleArt />} path={ProjectKey.CircleArt} />
              <Route element={<CircleIntersectionsWithGraphs />} path={ProjectKey.CircleIntersectionsWithGraphs} />
              <Route element={<EuclideanTilings />} path={ProjectKey.EuclideanTilings} />
              <Route element={<SnakeOptimalSolution />} path={ProjectKey.SnakeOptimalSolution} />
              <Route element={<Spirals />} path={ProjectKey.Spirals} />

              {/* A route used to generate tiling images */}
              <Route path="/tiling_generate/*" element={<EuclideanTilingsGenerate />} />
            </Route>
          </Routes>
        </Suspense>
      </ThemeProvider>
    </HelmetProvider>
  );
}
