import * as React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { useWindowScrollTo, useTheme, TypeTheme } from 'preshape';
import Landing from './Landing/Landing';
import Metas from './Metas/Metas';
import Spirals from './Projects/Spirals/Spirals';
import CircleIntersections from './Writings/CircleIntersections/CircleIntersections';
import GeneratingTesselations from './Writings/GeneratingTesselations/GeneratingTesselations';

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
  }, [location]);

  return (
    <RootContext.Provider value={ { onChangeTheme, theme } }>
      <Metas description="My personal projects and experience." />
      <Switch>
        <Route component={ Landing } exact path="/" />
        <Route component={ Spirals } path="/projects/spirals" />
        <Route component={ CircleIntersections } path="/writings/circle-intersections" />
        <Route component={ GeneratingTesselations } path="/writings/generating-tessellations" />
      </Switch>
    </RootContext.Provider>
  );
};

export default Site;
