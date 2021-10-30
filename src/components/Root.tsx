import { useWindowScrollTo, useTheme, TypeTheme } from 'preshape';
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
  onChangeTheme: (theme: TypeTheme) => void;
  theme: TypeTheme;
}>({
      onChangeTheme: () => undefined,
      theme: 'day',
    });


const Site = () => {
  const [theme, onChangeTheme] = React.useState<TypeTheme>('day');
  const history = useHistory();
  const location = useLocation();

  useTheme(theme);
  useWindowScrollTo();

  React.useEffect(() => {
    if (history.action === 'PUSH') {
      window.scrollTo({ top: 0 });
    }
  }, [location, history.action]);

  return (
    <RootContext.Provider value={ { onChangeTheme, theme } }>
      <Metas description="My personal projects and experience." />
      <Switch>
        <Route component={ Landing } exact path="/" />
        <Route component={ CircleGraph } path={ data.projects.CircleGraph.to } />
        <Route component={ Spirals } path={ data.projects.Spirals.to } />
        <Route component={ CircleIntersections } path={ data.writings.CircleIntersections.to } />
        <Route component={ CircleGraphs } path={ data.writings.CircleGraphs.to } />
        {/* <Route component={ GeneratingTessellations } path={ data.writings.GeneratingTessellations.to } /> */}
        <Route component={ SnakeSolution } path={ data.writings.SnakeSolution.to } />
      </Switch>
    </RootContext.Provider>
  );
};

export default Site;
