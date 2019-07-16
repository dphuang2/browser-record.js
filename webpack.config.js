const path = require('path');

module.exports = {
  entry: './src/browser-record.js',
  mode: 'development',
  output: {
    filename: 'browser-record.js',
    path: path.resolve(__dirname, 'dist')
  }
};
