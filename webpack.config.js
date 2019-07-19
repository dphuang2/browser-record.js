const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');

const config = {
  // master source file
  entry: path.resolve(__dirname, pkg.module),
  // settings for output logic
  output: {
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this',
    library: 'br',
    libraryTarget: 'umd',
  },
  // always in production cause we can use our local source file to debug
  mode: 'production',
  // for debugging minified file
  devtool: 'source-map',
  // allows es6 type javascript syntax
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [],
};

module.exports = (env, argv) => {
  // Inject API host dynamically based on environment
  let apiHost;
  if (env === 'prod') { apiHost = pkg.apiProd; } else apiHost = pkg.apiDev;
  config.plugins.push(
    new webpack.DefinePlugin({
      __API__: apiHost,
    }),
  );

  // dynamic logic using config variable constants
  config.output.filename = `${config.output.library}.min.js`;
  return config;
};
