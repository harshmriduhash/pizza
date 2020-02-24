// webserver and middleware
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import { logger } from './logger';
import { connect } from '../db';
import apiRoutes from './apiRoutes';

// environment variables
const isProduction = process.env.NODE_ENV === 'production';
const isIntegration = process.env.NODE_ENV === 'integration';

connect();
const app = express();

// configure Express
app.use(bodyParser.json());
apiRoutes(app);

let portNumber;
if (isProduction) {
  portNumber = 9000;
} else if (isIntegration) {
  portNumber = 9001;
} else {
  portNumber = 9002;
}

http.createServer(app).listen(portNumber);
logger.info(`listening on port ${portNumber}`);
