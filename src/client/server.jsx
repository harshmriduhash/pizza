import axios from 'axios';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryHistory, match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import createRoutes from './routes';
import configureStore from './store/configureStore';
import preRenderMiddleware from './middlewares/preRenderMiddleware';
import header from './components/Meta/Meta';

// setting up environment variables
const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';
const isIntegration = environment === 'integration';
const isDev = environment === 'development';

// TODO: read about what axios is/does
// configure baseURL for axios requests (for serverside API calls)
if (isProduction) {
  axios.defaults.baseURL = 'https://app.hungrybot.co/';
} else if (isIntegration) {
  axios.defaults.baseURL = 'https://int.hungrybot.co/';
} else {
  axios.defaults.baseURL = 'http://localhost:8080';
}

/*
 * Export render function to be used in server/config/routes.js
 * We grab the state passed in from the server and the req object from Express
 * and pass it into the Router.run function.
 */
export default function render(req, res) {
  const authenticated = req.isAuthenticated();
  const history = createMemoryHistory();
  const user = req.user
    ? {
      authenticated,
      isWaiting: false,
      message: '',
      email: req.user.get('email'),
      paypal: req.user.get('paypal'),
      twitch: req.user.get('twitch'),
      cadence: req.user.get('advertisement_cadence'),
      isBotPresent: req.user.get('is_bot_present'),
      isModerator: req.user.get('is_bot_moderator'),
      adsEnabled: req.user.get('advertisements_enabled'),
    }
    : {
      authenticated,
      isWaiting: false,
      message: '',
      email: '',
      paypal: '',
      twitch: '',
      cadence: 60,
      isBotPresent: false,
      isModerator: false,
      adsEnabled: false,
    };

  const store = configureStore({ user }, history);
  const routes = createRoutes(store);

  /*
   * From the react-router docs:
   *
   * This function is to be used for server-side rendering. It matches a set of routes to
   * a location, without rendering, and calls a callback(err, redirect, props)
   * when it's done.
   *
   * The function will create a `history` for you, passing additional `options` to create it.
   * These options can include `basename` to control the base name for URLs, as well as the pair
   * of `parseQueryString` and `stringifyQuery` to control query string parsing and serializing.
   * You can also pass in an already instantiated `history` object, which can be constructured
   * however you like.
   *
   * The three arguments to the callback function you pass to `match` are:
   * - err:       A javascript Error object if an error occured, `undefined` otherwise.
   * - redirect:  A `Location` object if the route is a redirect, `undefined` otherwise
   * - props:     The props you should pass to the routing context if the route matched,
   *              `undefined` otherwise.
   * If all three parameters are `undefined`, this means that there was no route found matching the
   * given location.
   */
  match({routes, location: req.url}, (err, redirect, props) => {
    if (err) {
      res.status(500).json(err);
    } else if (redirect) {
      res.redirect(302, redirect.pathname + redirect.search);
    } else if (props) {
      // This method waits for all render component
      // promises to resolve before returning to browser
      preRenderMiddleware(
        store.dispatch,
        props.components,
        props.params,
      )
      .then(() => {
        const initialState = store.getState();
        const componentHTML = renderToString(
          <Provider store={store}>
            <RouterContext {...props} />
          </Provider>
        );

        res.status(200).send(`
          <!doctype html ${header.htmlAttributes.toString()}>
          <html>
            <head>
              <script type="text/javascript" src="https://js.stripe.com/v2/"></script>
              ${header.title.toString()}
              ${header.meta.toString()}
              ${header.link.toString()}
            </head>
            <body>
              <div id="app">${componentHTML}</div>
              <script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};</script>
              <script type="text/javascript" charset="utf-8" src="/public/app.js"></script>
            </body>
          </html>
        `);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
    } else {
      res.sendStatus(404);
    }
  });
}
