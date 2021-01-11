/* eslint-disable @typescript-eslint/no-var-requires */


const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
}, {
  test: /\.(jpg|png|svg|ico|icns)$/,
  loader: "file-loader",
  options: {
    name: "[path][name].[ext]",
    publicPath: "..", // move up from 'main_window'
    context: "src", // set relative working folder to src
  },
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  target: 'electron-renderer',
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
  },
};
