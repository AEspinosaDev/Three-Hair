
const path = require('path');

const APP_PATH = __dirname;
const NODE_MODULES_PATH = path.resolve(APP_PATH, 'node_modules');
const THREE_PATH = path.resolve(NODE_MODULES_PATH, '@seddi', 'three');


module.exports = {
  entry: './src/index.ts',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // {
      //   test: /\.(js|mjs|jsx|ts|tsx)$/,
      //   loader: 'source-map-loader',
      //   enforce: 'pre',
      //   include: path.resolve(NODE_MODULES_PATH, '@seddi'),
      // },
    ],
  },
  resolve: {
    alias: {
      three: THREE_PATH,
    },
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};