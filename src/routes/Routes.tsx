import { LayoutContainer } from '../containers';
import {
  Routes as Switch,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAniStore } from '@/store';
import { mainPanels } from './routesConfig';
import React from 'react';

const Routes = () => {
  const location = useLocation();
  const [setScroll] = useAniStore((state) => [state.setScroll]);

  const renderChildPanels = (childPanels: any, path: string) => {
    if (!childPanels?.length) {
      return null;
    }

    return (
      <Route key={'child-main-route' + path} path={path}>
        {childPanels.map(({ route, Panel }, k) => (
          <Route
            key={'nested-route-' + k + route}
            path={route}
            element={<Panel />}
          />
        ))}
      </Route>
    );
  };

  return (
    <AnimatePresence mode="wait" onExitComplete={() => setScroll(true)}>
      <Switch key={location.pathname} location={location}>
        <Route path={'/'} element={<LayoutContainer />}>
          {mainPanels.map(({ route, Panel, childPanels }, j) => (
            <React.Fragment key={'main-route' + j + route}>
              <Route path={route} element={<Panel />} />
              {renderChildPanels(childPanels, route)}
            </React.Fragment>
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/service-insight" replace />} />
      </Switch>
    </AnimatePresence>
  );
};
export default Routes;
