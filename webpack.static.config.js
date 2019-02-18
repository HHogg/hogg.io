const { resolve } = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: [
    'babel-polyfill',
    './src/static.js',
  ],
  output: {
    filename: 'assets/hogg.io.[hash].min.js',
    globalObject: 'this',
    path: resolve(__dirname, 'public'),
    publicPath: '/',
    libraryTarget: 'umd',
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: ['babel-loader'],
      include: [/src/],
    }, {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
    }, {
      test: /\.ejs$/,
      use: ['ejs-loader'],
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
  optimization: {
    minimizer: [new TerserPlugin({
      parallel: true,
      sourceMap: true,
    })],
  },
  plugins: [
    new CleanWebpackPlugin(['public']),
    new MiniCssExtractPlugin({
      filename: 'assets/hogg.io.[hash].min.css',
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new StaticSiteGeneratorPlugin({
      paths: ['/'],
      crawl: true,
    }),
    new CopyWebpackPlugin([{
      from: './src/assets',
      to: './assets',
    }]),
    new webpack.EnvironmentPlugin({
      BABEL_ENV: 'production',
      NODE_ENV: 'production',
    }),
  ],
};
