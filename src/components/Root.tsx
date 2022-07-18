import {
  useWindowScrollTo,
  useTheme,
  TypeTheme,
  Box,
  useMatchMedia,
} from 'preshape';
import * as React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import data from '../data';
import Landing from './Landing/Landing';
import Metas from './Metas/Metas';
import CircleGraph from './Projects/CircleGraph/CircleGraph';
import Spirals from './Projects/Spirals/Spirals';
import CircleGraphs from './Writings/CircleGraphs/CircleGraphs';
import CircleIntersections from './Writings/CircleIntersections/CircleIntersections';
import GeneratingTessellations from './Writings/GeneratingTessellations/GeneratingTessellations';
import SnakeSolution from './Writings/SnakeSolution/SnakeSolution';

export const RootContext = React.createContext<{
  layout: 's' | 'm' | 'l';
  onChangeTheme: (theme: TypeTheme) => void;
  theme: TypeTheme;
}>({
  layout: 'l',
  onChangeTheme: () => undefined,
  theme: 'day',
});

const Site = () => {
  const [theme, onChangeTheme] = React.useState<TypeTheme>('day');
  const history = useHistory();
  const location = useLocation();
  const match = useMatchMedia(['800px', '1200px']);
  const layout = match({ '480px': 'm', '1200px': 'l' }) || 's';

  useTheme(theme);
  useWindowScrollTo();

  React.useEffect(() => {
    if (history.action === 'PUSH') {
      window.scrollTo({ top: 0 });
    }
  }, [location, history.action]);

  return (
    <RootContext.Provider value={{ layout, onChangeTheme, theme }}>
      <Metas description="My personal projects and experience." />
      <Box
        flex="vertical"
        grow
        padding={layout === 'm' || layout === 'l' ? 'x6' : 'x0'}
      >
        <Switch>
          <Route component={Landing} exact path="/" />
          <Route component={CircleGraph} path={data.projects.CircleGraph.to} />
          <Route component={Spirals} path={data.projects.Spirals.to} />
          <Route
            component={CircleIntersections}
            path={data.writings.CircleIntersections.to}
          />
          <Route
            component={CircleGraphs}
            path={data.writings.CircleGraphs.to}
          />
          <Route
            component={GeneratingTessellations}
            path={data.writings.GeneratingTessellations.to}
          />
          <Route
            component={SnakeSolution}
            path={data.writings.SnakeSolution.to}
          />
        </Switch>
      </Box>
    </RootContext.Provider>
  );
};

export default Site;
