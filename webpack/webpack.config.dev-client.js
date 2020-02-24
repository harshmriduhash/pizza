require('babel-register');

var path = require('path');
var webpack = require('webpack');
var styleLintPlugin = require('stylelint-webpack-plugin');
var assetsPath = path.join(__dirname, '..', 'public');
const clientPath = path.join(__dirname, '..', 'src', 'client');
const modulesPath = path.join(__dirname, '..', 'node_modules');
var hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';

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
  __DEVCLIENT__: true,
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
      presets: ['react-hmre', 'es2015', 'react', 'stage-0'],
      plugins: ['transform-decorators-legacy']
    },
    include: clientPath,
    exclude: modulesPath
  }, {
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
    // eval - Each module is executed with eval and //@ sourceURL.
    devtool: 'eval',
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
     // exclude some external libraries from our bundle when testing
    externals: {
      'react/lib/ReactContext': true,
      'react/lib/ExecutionEnvironment': true,
      'react/addons': true
    },
    context: clientPath,
    // Multiple entry with hot loader
    // https://github.com/glenjamin/webpack-hot-middleware/blob/master/example/webpack.config.multientry.js
    entry: {
      app: ['babel-polyfill', 'whatwg-fetch', './client', hotMiddlewareScript]
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
      preLoaders: [{
        test: /\.js$|\.jsx$/,
        loader: 'eslint-loader',
        exclude: modulesPath
      }],
      loaders: commonLoaders.concat([{
        test: /\.css$/,
        include: [clientPath],
        loader: 'style!css?module&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
      }, {
        test: /\.css$/,
        include: [modulesPath],
        loader: 'style!css'
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
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin(stringDefines),
        new styleLintPlugin({
          configFile: path.join(__dirname, '..', '.stylelintrc'),
          context: clientPath,
          files: '**/*.?(sa|sc|c)ss'
        })
    ],
    postcss: [].concat([
      require('precss')({}),
      require('autoprefixer')({}),
      require('cssnano')({})
    ])
};
