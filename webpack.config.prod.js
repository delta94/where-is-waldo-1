const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    app: './src/app.js',
    leaderboard: './src/components/leaderboard/leaderboard.js'
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    /* name of the repo (if deploying to gh-pages)
      or '/' (if deploying to firebase) */
    publicPath: '/where-is-waldo/'
  },

  devServer: {
    contentBase: path.resolve(__dirname, 'dist')
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },

      {
        test: /\.js$/,
        exclude: '/node_modules/',
        use: [
          'babel-loader',
          'eslint-loader'
        ]
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      chunks: ['app']
    }),
    new HtmlWebpackPlugin({
      template: 'src/components/leaderboard/leaderboard.html',
      filename: 'leaderboard.html',
      chunks: ['leaderboard']
    }),
    new MiniCssExtractPlugin(),
    new OptimizeCssAssetsPlugin()
  ]
}
