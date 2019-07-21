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
        },
      },
    ],
  },
  plugins: [],
};

module.exports = (env, argv) => {
  // Development / production behavior
  let apiHost;
  if (env === 'prod') {
    apiHost = pkg.apiProd;
    config.output.filename = `${config.output.library}.min.js`;
    config.mode = 'production';
  } else {
    apiHost = pkg.apiDev;
    config.output.filename = `${config.output.library}.js`;
    config.mode = 'development';
  }
  config.plugins.push(
    new webpack.DefinePlugin({
      __API__: apiHost,
    }),
  );

  return config;
};
