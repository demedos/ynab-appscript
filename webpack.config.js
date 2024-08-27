const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

/**
 * @see https://webpack.js.org/configuration
 * @type {import("webpack").Configuration}
 */
module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    iife: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'src/appsscript.json', to: 'appsscript.json' }],
    }),
  ],
  devtool: 'source-map',
};