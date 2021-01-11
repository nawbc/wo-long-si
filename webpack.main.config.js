/* eslint-disable @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',
  // Put your normal webpack config below here
  target: 'electron-main',
  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/main/icons'),
          to: path.resolve(__dirname, '.webpack/main', 'icons')
        }
      ]
    })
  ],
  node: {
    global: true,
    __dirname: true,
    __filename: true
  }
};