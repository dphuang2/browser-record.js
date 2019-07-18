const path = require('path');
const pkg = require('./package.json');

var config = {
  entry: path.resolve(__dirname, pkg.module),
  output: {
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this',
    library: 'br',
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
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
  if (argv.mode === 'development')
    config.output.filename = config.output.library + '.js';
  else if (argv.mode === 'production')
    config.output.filename = config.output.library + '.min.js';
  return config;
}

