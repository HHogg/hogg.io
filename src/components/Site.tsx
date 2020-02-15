import * as React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import { useWindowScrollTo, useTheme } from 'preshape';
import { RootContext } from './Root';
import Landing from './Landing/Landing';
import Spirals from './Projects/Spirals/Spirals';
import CircleIntersections from './Writings/CircleIntersections/CircleIntersections';
import GeneratingTesselations from './Writings/GeneratingTesselations/GeneratingTesselations';

const Site = () => {
  const { theme } = React.useContext(RootContext);
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
    <Switch>
      <Route component={ Landing } exact path="/" />
      <Route component={ Spirals } path="/projects/spirals" />
      <Route component={ CircleIntersections } path="/writings/circle-intersections" />
      <Route component={ GeneratingTesselations } path="/writings/generating-tessellations" />
    </Switch>
  );
};

export default hot(module)(Site);
