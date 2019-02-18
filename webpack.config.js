const webpack = require('webpack');
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const port = process.env.PORT || 4001;

module.exports = {
  mode: 'development',
  entry: [
    'react-hot-loader/patch',
    `webpack-dev-server/client?http://localhost:${port}`,
    'webpack/hot/only-dev-server',
    './src/index.js',
  ],
  output:  {
    filename: 'bundle.js',
    globalObject: 'this',
    publicPath: '/',
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: ['babel-loader'],
      include: [/src/],
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader', 'postcss-loader'],
    }, {
      test: /\.md$/,
      use: ['raw-loader'],
    }, {
      test: /.svg$/,
      loader: 'svg-inline-loader',
    }, {
      test: /\.worker\.js$/,
      use: ['worker-loader'],
    }, {
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    }],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new webpack.DefinePlugin({
      __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })',
    }),
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: resolve(__dirname, 'src'),
    historyApiFallback: {
      disableDotRule: true,
    },
    host: 'localhost',
    hot: true,
    port: port,
  },
};
