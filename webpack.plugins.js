/* eslint-disable @typescript-eslint/no-var-requires */

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const assets = ['assets'];
const copyPlugins = assets.map(asset => {
  return new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'src/renderer', asset),
        to: path.resolve(__dirname, '.webpack/renderer/main_window', asset)
      }
    ]
  });
});


module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  ...copyPlugins
];
