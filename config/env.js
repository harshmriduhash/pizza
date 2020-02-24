
// helpers to correctly concat paths together
const path = require('path');
const join = path.join;
const resolve = path.resolve;

// setting up environment variables
const NODE_ENV = process.env.NODE_ENV;
const dotenv = require('dotenv');

// global environment variables can be read in from our .env file
const dotEnvVars = dotenv.config();

// environment specific variables come from environment specific config files
const environmentEnv = dotenv.config({
  path: join('config', `${NODE_ENV}.env`),
  silent: true
});

// merge our global config with our environment config
const envVariables = Object.assign({}, dotEnvVars, environmentEnv);

// creating an array of config vars to use in the format of __VARIABLE__
const defines =
  Object.keys(envVariables)
    .reduce((memo, key) => {
      const val = envVariables[key];
      memo[`__${key.toUpperCase()}__`] = val;
      return memo;
    }, {
      __NODE_ENV__: NODE_ENV
    });

module.exports = defines;
