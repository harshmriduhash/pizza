const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
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
  __DEVSERVER__: false,
};
const keys = Object.keys(defines);
for (var i = 0; i < keys.length; i++) {
  stringDefines[keys[i]] = JSON.stringify(defines[keys[i]]);
}

var commonLoaders = [
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
  }, {
    test: /\.css$/,
    loader: ExtractTextPlugin.extract('style-loader', 'css-loader?module!postcss-loader'),
    include: clientPath,
    exclude: modulesPath
  }, {
    test: /\.css$/,
    loader: ExtractTextPlugin.extract('style-loader', 'css-loader'),
    include: modulesPath,
    exclude: clientPath
  }
];

module.exports = [
  {
    // The configuration for the client
    name: 'browser',
    /* The entry point of the bundle
     * Entry points for multi page app could be more complex
     * A good example of entry points would be:
     * entry: {
     *   pageA: "./pageA",
     *   pageB: "./pageB",
     *   pageC: "./pageC",
     *   adminPageA: "./adminPageA",
     *   adminPageB: "./adminPageB",
     *   adminPageC: "./adminPageC"
     * }
     *
     * We can then proceed to optimize what are the common chunks
     * plugins: [
     *  new CommonsChunkPlugin("admin-commons.js", ["adminPageA", "adminPageB"]),
     *  new CommonsChunkPlugin("common.js", ["pageA", "pageB", "admin-commons.js"], 2),
     *  new CommonsChunkPlugin("c-commons.js", ["pageC", "adminPageC"]);
     * ]
     */
    // SourceMap without column-mappings
    devtool: 'cheap-module-source-map',
    context: clientPath,
    entry: {
      app: ['babel-polyfill', 'whatwg-fetch', './client']
    },
    output: {
      // The output directory as absolute path
      path: assetsPath,
      // The filename of the entry chunk as relative path inside the output.path directory
      filename: '[name].js',
      // The output path from the view of the Javascript
      publicPath: publicPath
    },
    module: {
      loaders: commonLoaders
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
        // extract inline css from modules into separate files
        new ExtractTextPlugin('styles/main.css', { allChunks: true }),
        new webpack.optimize.UglifyJsPlugin({
          compressor: {
            warnings: false
          }
        }),
        new webpack.DefinePlugin(stringDefines)
    ],
    postcss: [].concat([
      require('precss')({}),
      require('autoprefixer')({}),
      require('cssnano')({})
    ])
  }, {
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
      loaders: commonLoaders
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
        // Order the modules and chunks by occurrence.
        // This saves space, because often referenced modules
        // and chunks get smaller ids.
        new webpack.optimize.OccurenceOrderPlugin(),
        new ExtractTextPlugin('styles/main.css', { allChunks: true }),
        new webpack.optimize.UglifyJsPlugin({
          compressor: {
            warnings: false
          }
        }),
        new webpack.DefinePlugin(stringDefines),
        new webpack.IgnorePlugin(/vertx/)
    ],
    postcss: [].concat([
      require('precss')({}),
      require('autoprefixer')({}),
      require('cssnano')({})
    ])
  }
];
