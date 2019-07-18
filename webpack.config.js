const path = require('path');
const pkg = require('./package.json');

var config = {
  // master source file
  entry: path.resolve(__dirname, pkg.module),
  // settings for output logic
  output: {
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this',
    library: 'br',
    libraryTarget: 'umd'
  },
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
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};

module.exports = (env, argv) => {
  // dynamic logic using config variable constants
  config.output.filename = config.output.library + '.min.js';
  return config;
}

