import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from 'containers/App/App.jsx';
import Order from 'containers/Order/Order.jsx';
import Dashboard from 'containers/Dashboard/Dashboard.jsx';
import Settings from 'components/DashboardComponents/Settings/Settings.jsx';
import Overview from 'components/DashboardComponents/Overview/Overview.jsx';
import LogOut from 'components/LogOut/LogOut.jsx';

/*
 * @param {Redux Store}
 * We require store as an argument here because we wish to get
 * state from the store after it has been authenticated.
 */
export default (store) => {
  const requireAuth = (nextState, replace, callback) => {
    const { user: { authenticated } } = store.getState();
    if (!authenticated) {
      replace({
        pathname: '/login',
        state: { nextPathname: nextState.location.pathname },
      });
    }
    callback();
  };

  const requireCadence = (nextState, replace, callback) => {
    const { user: { cadence } } = store.getState();
    if (cadence < 0) {
      replace({
        pathname: '/dashboard/setup',
        state: { nextPathname: nextState.location.pathname },
      });
    }
    callback();
  };

  return (
    <Route path="/" component={App}>
      <Route path="order/:streamerId/:username" component={Order} />
      <Route path="dashboard" component={Dashboard} onEnter={requireAuth}>
        <IndexRoute component={Overview} onEnter={requireCadence} />
        <Route path="setup" component={Settings} />
      </Route>
      <Route path="logout" component={LogOut} />
    </Route>
  );
};
