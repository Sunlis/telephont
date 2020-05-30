var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'dist/app');
var APP_DIR = path.resolve(__dirname, 'src/app');
var SRC_DIR = path.resolve(__dirname, 'src');

var config = {
  entry: APP_DIR + '/index.tsx',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        exclude: [
          /node_modules/,
        //   /src/,
        ],
        include: [
          APP_DIR,
          SRC_DIR,
        ],
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },

    ],
  },
};

module.exports = config;