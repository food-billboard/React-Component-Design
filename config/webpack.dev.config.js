const path = require('path')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = merge(baseConfig, {
  mode: "development",
  entry: path.resolve(__dirname, '../src/index.js'),
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: "[name].[hash].bundle.js"
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
        use: "url-loader"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new CleanWebpackPlugin()
  ],
  devServer: {
    contentBase: path.resolve(__dirname, '../lib'),
    hot: true,
    compress: true,
    port: 3001,
    // open: true,
    // proxy: {
    //   '': {
    //     target: '',
    //     secure: false
    //   }
    // }
  }
})