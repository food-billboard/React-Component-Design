const path = require('path')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const webpack = require('webpack')

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: path.resolve(__dirname, '../src/index.js'),
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: 'index.js',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: [MiniCssExtractPlugin.loader, 'css-loader?modules']
      },
      {
        test: /\.(png|jpg|gif|jpeg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      }, 
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new UglifyWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].css'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.HashedModuleIdsPlugin(),
    new CompressionPlugin({
      test: /\.tsx?$/
    }),
  ],
  optimization: {
    // splitChunks: {
    //   cacheGroups: {
    //     vendor: {
    //       name: 'vendor',
    //       filename: '[name].js',
    //       minChunks: function(module, count) {
    //         return (
    //           module.resource &&
    //           /\.js$/.test(module.resource) &&
    //           module.resource.indexOf(path.join(__dirname, './node_modules')) === 0
    //         )
    //       }
    //     },
    //     runtime: {
    //       name: 'runtime',
    //       filename: '[name].js',
    //       chunks: ['vendor']
    //     }
    //   }
    // }
  },
  externals: {
    react: {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react"
    },
    "react-dom": {
      root: "ReactDOM",
      commonjs2: "react-dom",
      commonjs: "react",
      amd: "react-dom"
    },
    lodash: {
      root: '_',
      commonjs2: 'lodash',
      commonjs: 'lodash',
      amd: 'lodash'
    }
  }
})