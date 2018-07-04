var path = require('path');

module.exports = {
  entry: {
    app: ['./example/src/index.js']
  },

  output: {
    path: __dirname + '/example',
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/, loader: "style-loader!css-loader"
      }
    ]
  },


  devServer: {
    contentBase: './example',
    host: 'localhost'
  }
};
