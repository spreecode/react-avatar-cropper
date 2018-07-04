var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: {
    app: ["./lib/index.js"]
  },

  output: {
    filename: "ReactAvatarCropper.min.js",
    path: __dirname + "/dist",
    libraryTarget: "umd",
    library: "ReactAvatarCropper"
  },

  externals: {
    react: "react",
    "react-dom": "react-dom",
    "semantic-ui-react": "semantic-ui-react"
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  }
};
