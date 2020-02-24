const path = require('path');
const webpack = require('webpack');
const assetsPath = path.join(__dirname, '..', 'public');
const clientPath = path.join(__dirname, '..', 'src', 'client');
const modulesPath = path.join(__dirname, '..', 'node_modules');

// setting up environment variables
const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';
const isIntegration = environment === 'integration';
const isDev = environment === 'development';

let publicPath;
if (isProduction) {
  publicPath = 'https://app.hungrybot.co/public/';
} else if (isIntegration) {
  publicPath = 'https://int.hungrybot.co/public/';
} else {
  publicPath = 'http://localhost:8080/public/';
}

// we need to use JSON.stringify for replacement on the client side
const defines = require('../config/env');
const stringDefines = {
  __DEVCLIENT__: false,
  __DEVSERVER__: true,
};
const keys = Object.keys(defines);
for (var i = 0; i < keys.length; i++) {
  stringDefines[keys[i]] = JSON.stringify(defines[keys[i]]);
}

const commonLoaders = [
  {
    /*
     * TC39 categorises proposals for babel in 4 stages
     * Read more http://babeljs.io/docs/usage/experimental/
     */
    test: /\.js$|\.jsx$/,
    loader: 'babel-loader',
    // Reason why we put this here instead of babelrc
    // https://github.com/gaearon/react-transform-hmr/issues/5#issuecomment-142313637
    query: {
      presets: ['es2015', 'react', 'stage-0'],
      plugins: ['transform-decorators-legacy']
    },
    include: clientPath,
    exclude: modulesPath
  },
  { test: /\.json$/, loader: 'json-loader' },
  {
    test: /\.png$/,
    loader: 'url?limit=10000&mimetype=image/png',
  }, {
    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
    loader: "url?limit=10000&mimetype=application/font-woff"
  }, {
    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
    loader: "url?limit=10000&mimetype=application/font-woff"
  }, {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    loader: "url?limit=10000&mimetype=application/octet-stream"
  }, {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    loader: "file"
  }, {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    loader: "url?limit=10000&mimetype=image/svg+xml"
  },
  { test: /\.html$/, loader: 'html-loader' }
];

module.exports = {
    // The configuration for the server-side rendering
    name: 'server-side rendering',
    context: clientPath,
    entry: {
      server: './server'
    },
    target: 'node',
    output: {
      // The output directory as absolute path
      path: assetsPath,
      // The filename of the entry chunk as relative path inside the output.path directory
      filename: 'server.js',
      // The output path from the view of the Javascript
      publicPath: publicPath,
      libraryTarget: 'commonjs2'
    },
    module: {
      loaders: commonLoaders.concat([{
        test: /\.css$/,
        loader: 'css/locals?module&localIdentName=[name]__[local]___[hash:base64:5]'
      }])
    },
    resolve: {
      root: [clientPath],
      extensions: ['', '.js', '.jsx', '.css'],
      alias: {
        'containers': path.join(clientPath, 'containers'),
        'components': path.join(clientPath, 'components'),
        'utils': path.join(clientPath, 'utils'),
        'types': path.join(clientPath, 'types'),
        'reducers': path.join(clientPath, 'reducers'),
        'middlewares': path.join(clientPath, 'middlewares'),
        'styles': path.join(clientPath, 'styles')
      }
    },
    plugins: [
        new webpack.DefinePlugin(stringDefines),
        new webpack.IgnorePlugin(/vertx/)
    ]
};
