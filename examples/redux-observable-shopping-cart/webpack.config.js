const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const env = process.env.NODE_ENV || 'development'

module.exports = {
  mode: env,
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['react']
          }
        }
      }
    ]
  },
  stats: {
    colors: true
  },
  plugins: [
    new CleanWebpackPlugin(['build']),
    new HtmlWebpackPlugin({ template: './index.html' })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    port: 8080
  },
  devtool: 'eval-source-map'
}
