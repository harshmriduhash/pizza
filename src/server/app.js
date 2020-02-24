import express from 'express';
import webpack from 'webpack';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { connect } from '../db';
import passportConfig from './config/passport';
import expressConfig from './config/express';
import routesConfig from './config/routes';
import orderRoutes from './config/orderRoutes';
import botServerRoutes from './config/botServerRoutes';

// this is our server-side rendering component
const App = require('../../public/server'); // eslint-next-line
const app = express();

// environment variables
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isIntegration = environment === 'integration';
const isDev = environment === 'development';

// hot reloading of client code
import webpackConfig from '../../webpack/webpack.config.dev-client';
const compiler = webpack(webpackConfig);
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

connect();
passportConfig();

if (isDev) {
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
  }));
  app.use(webpackHotMiddleware(compiler));
}

expressConfig(app);
routesConfig(app);
botServerRoutes(app);
orderRoutes(app);

/*
 * This is where the magic happens. We take the locals data we have already
 * fetched and seed our stores with data.
 * App is a function that requires store data and url
 * to initialize and return the React-rendered html string
 */
app.get('*', App.default);

let httpsOptions;
if (isProduction) {
  httpsOptions = {
    key: fs.readFileSync(path.resolve(__dirname, '../../../resources/app.hungrybot.co.key')),
    cert: fs.readFileSync(path.resolve(__dirname, '../../../resources/app_hungrybot_co.crt')),
    ca: fs.readFileSync(path.resolve(__dirname, '../../../resources/app_hungrybot_co.ca-bundle')),
  };

  https.createServer(httpsOptions, app).listen(app.get('port'));
} else if (isIntegration) {
  httpsOptions = {
    key: fs.readFileSync(path.resolve(__dirname, '../../../resources/int.hungrybot.co.key')),
    cert: fs.readFileSync(path.resolve(__dirname, '../../../resources/int_hungrybot_co.crt')),
    ca: fs.readFileSync(path.resolve(__dirname, '../../../resources/int_hungrybot_co.ca-bundle')),
  };

  https.createServer(httpsOptions, app).listen(app.get('port'));
} else {
  http.createServer(app).listen(app.get('port'));
}
