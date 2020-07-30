const path = require('path')

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'ts-loader'
          }
        ],
        include: /src/,
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: {
      "@":path.resolve(__dirname, "../src")
    },
    extensions: [".ts", ".tsx", ".js"]
  },
}