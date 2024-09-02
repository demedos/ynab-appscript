const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

/**
 * @see https://webpack.js.org/configuration
 * @type {import("webpack").Configuration}
 */
module.exports = {
  entry: './src/index.ts',

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    iife: false,
    clean: true,
  },

  mode: 'development',

  optimization: {
    minimize: false,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'src/appsscript.json', to: 'appsscript.json' }],
    }),
  ],

  devtool: 'source-map',
};
