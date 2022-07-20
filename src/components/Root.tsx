import {
  useWindowScrollTo,
  useTheme,
  TypeTheme,
  Box,
  useMatchMedia,
} from 'preshape';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import data from '../data';
import Landing from './Landing/Landing';
import Metas from './Metas/Metas';
import CircleGraph from './Projects/CircleGraph/CircleGraph';
import Snake from './Projects/Snake/Snake';
import Spirals from './Projects/Spirals/Spirals';
import CircleGraphs from './Writings/CircleGraphs/CircleGraphs';
import CircleIntersections from './Writings/CircleIntersections/CircleIntersections';
import GeneratingTessellations from './Writings/GeneratingTessellations/GeneratingTessellations';
import SnakeSolution from './Writings/SnakeSolution/SnakeSolution';

export const RootContext = createContext<{
  layout: 's' | 'm' | 'l';
  onChangeTheme: (theme: TypeTheme) => void;
  theme: TypeTheme;
}>({
  layout: 'l',
  onChangeTheme: () => undefined,
  theme: 'day',
});

export const useLayoutContext = () => useContext(RootContext);

const Site = () => {
  const [theme, onChangeTheme] = useState<TypeTheme>('day');
  const location = useLocation();
  const match = useMatchMedia(['800px', '1200px']);
  const layout = match({ '480px': 'm', '1200px': 'l' }) || 's';

  useTheme(theme);
  useWindowScrollTo();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <RootContext.Provider value={{ layout, onChangeTheme, theme }}>
      <Metas description="My personal projects and experience." />

      <Box
        flex="vertical"
        grow
        padding={layout === 'm' || layout === 'l' ? 'x6' : 'x0'}
      >
        <Routes>
          <Route path="/">
            <Route index element={<Landing />} />
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
              element={<GeneratingTessellations />}
              path={data.writings.GeneratingTessellations.to}
            />
            <Route
              element={<SnakeSolution />}
              path={data.writings.SnakeSolution.to}
            />
          </Route>
        </Routes>
      </Box>
    </RootContext.Provider>
  );
};

export default Site;
