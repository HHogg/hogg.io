import {
  useWindowScrollTo,
  Box,
  useMatchMedia,
  Text,
  ThemeProvider,
} from 'preshape';
import { lazy, useEffect, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import data from '../data';
import Metas from './Metas/Metas';

import 'preshape/dist/style.css';
import './Root.css';

const Landing = lazy(() => import('./Landing/Landing'));
const CircleArt = lazy(() => import('./Projects/CircleArt/CircleArt'));
const CircleGraph = lazy(() => import('./Projects/CircleGraph/CircleGraph'));
const Snake = lazy(() => import('./Projects/Snake/Snake'));
const Spirals = lazy(() => import('./Projects/Spirals/Spirals'));
const CircleGraphs = lazy(() => import('./Writings/CircleGraphs/CircleGraphs'));
const CircleIntersections = lazy(
  () => import('./Writings/CircleIntersections/CircleIntersections')
);
const SnakeSolution = lazy(
  () => import('./Writings/SnakeSolution/SnakeSolution')
);

const Site = () => {
  const location = useLocation();
  const match = useMatchMedia(['800px', '1200px']);
  const layout = match({ '480px': 'm', '1200px': 'l' }) || 's';

  useWindowScrollTo();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <Metas description="My personal projects and experience." />

      <Box
        flex="vertical"
        grow
        padding={layout === 'm' || layout === 'l' ? 'x6' : 'x0'}
      >
        <Suspense
          fallback={
            <Box alignChildren="middle" flex="horizontal" grow>
              <Text size="x5" weight="x2" textColor="light-shade-1">
                ;)
              </Text>
            </Box>
          }
        >
          <Routes>
            <Route path="/">
              <Route index element={<Landing />} />
              <Route
                element={<CircleArt />}
                path={data.projects.CircleArt.to}
              />
              <Route
                element={<CircleGraph />}
                path={data.projects.CircleGraph.to}
              />
              <Route element={<Spirals />} path={data.projects.Spirals.to} />
              <Route element={<Snake />} path={data.projects.Snake.to} />
              <Route
                element={<CircleIntersections />}
                path={data.writings.CircleIntersections.to}
              />
              <Route
                element={<CircleGraphs />}
                path={data.writings.CircleGraphs.to}
              />
              <Route
                element={<SnakeSolution />}
                path={data.writings.SnakeSolution.to}
              />
            </Route>
          </Routes>
        </Suspense>
      </Box>
    </ThemeProvider>
  );
};

export default Site;
