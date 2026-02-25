const HtmlWebpackPlugin = require('html-webpack-plugin')
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const DEV = process.env.NODE_ENV !== 'production';
const PUBLIC_PATH = process.env.PUBLIC_PATH || (DEV ? '/' : '/ocaml-astexplorer/');
const CACHE_BREAKER = Number(fs.readFileSync(path.join(__dirname, 'CACHE_BREAKER')));

const plugins = [
  new webpack.DefinePlugin({
    'process.env.API_HOST': JSON.stringify(process.env.API_HOST || ''),
  }),
  new webpack.IgnorePlugin(/\.md$/),

  new MiniCssExtractPlugin({
    filename: DEV ? '[name].css' : `[name]-[contenthash]-${CACHE_BREAKER}.css`,
    allChunks: true,
  }),

  new HtmlWebpackPlugin({
    favicon: './favicon.png',
    inject: 'body',
    filename: 'index.html',
    template: './index.ejs',
    chunksSortMode: 'id',
  }),

  // Inline runtime and manifest into the HTML. It's small and changes after every build.
  new InlineManifestWebpackPlugin(),
  new webpack.ProgressPlugin({
    modules: false,
    activeModules: false,
    profile: false,
  }),
];

module.exports = Object.assign({
  optimization: {
    moduleIds: DEV ? 'named' : 'hashed',
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'initial',
      maxAsyncRequests: 5,
      cacheGroups: {
        parsers: {
          priority: 10,
          test: /\/src\/parsers\/|\/package\.json$/,
        },
        vendors: {
          test: /\/node_modules\//,
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        // Exclude async chunks (e.g. the astexplorer-refmt bundle) —
        // they contain modern syntax that this version of Terser cannot parse.
        exclude: /^\d+[-\w]*.js$/,
        terserOptions: {
          keep_fnames: true,
        },
      }),
    ],
  },

  module: {
    rules: [
      {
        test: [
          /\.d\.ts$/,
        ],
        use: 'null-loader',
      },
      {
        test: /\.txt$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
      // This rule is needed to make sure *.mjs files in node_modules are
      // interpreted as modules.
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(jsx?|mjs)$/,
        type: 'javascript/auto',
        include: [
          path.join(__dirname, 'node_modules', 'react-redux', 'es'),
          path.join(__dirname, 'node_modules', 'redux', 'es'),
          path.join(__dirname, 'node_modules', 'lodash-es'),
          path.join(__dirname, 'node_modules', 'symbol-observable', 'es'),
          path.join(__dirname, 'src'),
        ],
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            [
              require.resolve('@babel/preset-env'),
              {
                targets: {
                  browsers: ['defaults'],
                },
                modules: 'commonjs',
              },
            ],
            require.resolve('@babel/preset-react'),
          ],
          plugins: [
            require.resolve('@babel/plugin-transform-runtime'),
          ],
        },
      },
      {
        test: /\.css$/,
        use: [
          DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
      },
    ],

    noParse: [
      /astexplorer-refmt\/dist\/ast_explorer_refmt\.bc\.js/,
    ],
  },
  node: {
    child_process: 'empty',
    fs: 'empty',
    module: 'empty',
    net: 'empty',
    os: 'empty',
    tty: 'empty',
  },

  plugins: plugins,

  entry: {
    app: './src/app.js',
  },

  output: {
    path: path.resolve(__dirname, '../out'),
    publicPath: PUBLIC_PATH,
    filename: DEV ? '[name].js' : `[name]-[contenthash]-${CACHE_BREAKER}.js`,
    chunkFilename: DEV ? '[name].js' : `[name]-[contenthash]-${CACHE_BREAKER}.js`,
  },
},

  DEV ?
    {
      devtool: 'eval',
    } :
    {},
);
