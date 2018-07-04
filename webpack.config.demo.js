var path = require('path');

module.exports = {
  entry: {
    app: ['./example/src/index.js']
  },

  output: {
    filename: __dirname + '/example/bundle.js',
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  }
};
