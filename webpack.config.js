const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    app: './src/app.js',
    leaderboard: './src/components/leaderboard/leaderboard.js'
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/' // Might cause an error in case of code splitting
  },

  devServer: {
    contentBase: path.resolve(__dirname, 'dist')
  },

  devtool: 'cheap-module-eval-source-map',

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },

      {
        test: /\.js$/,
        exclude: '/node_modules/',
        use: [
          'babel-loader?compact=false',
          'eslint-loader'
        ]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      chunks: ['app']
    }),
    new HtmlWebpackPlugin({
      template: 'src/components/leaderboard/leaderboard.html',
      filename: 'leaderboard.html',
      chunks: ['leaderboard'],
      inject: false
    })
  ]
}
