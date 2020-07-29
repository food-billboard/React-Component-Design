const path = require('path')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.base')

module.exports = merge(baseConfig, {
  mode: "development",
  entry: path.resolve(__dirname, '../src/index.js'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /\.min\.css$/,
        loader: ["style-loader", "css-loader?modules"]
      },
      {
        test: /\.min\.css$/,
        loader: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|fig|jpeg)$/,
        use: "file-loader"
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader'
        }
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, '../dist'),
    hot: true,
    compress: true,
    port: 3001,
    open: true,
    // proxy: {
    //   '': {
    //     target: '',
    //     secure: false
    //   }
    // }
  }
})