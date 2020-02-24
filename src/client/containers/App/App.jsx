import React, { PropTypes } from 'react';
import 'styles/app.css';
// import Header from 'components/OrderComponents/Header/Header';
// import Footer from 'components/OrderComponents/Footer/Footer';

/*
 * React-router's <Router> component renders <Route>'s
 * and replaces `this.props.children` with the proper React Component.
 *
 * Please refer to `routes.jsx` for the route config.
 *
 * A better explanation of react-router is available here:
 * https://github.com/rackt/react-router/blob/latest/docs/Introduction.md
 */
const App = ({ children }) =>
  <div>
    {children}
  </div>;

App.propTypes = {
  children: PropTypes.object,
};

export default App;
