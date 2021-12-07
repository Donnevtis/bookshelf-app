const { resolve } = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const devMode = process.env.NODE_ENV !== 'production';

exports.default = {
  mode: devMode ? 'development' : 'production',
  context: resolve(__dirname, 'src'),
  entry: './main.js',
  output: {
    filename: 'assets/index.[contenthash].js',
    path: resolve(__dirname, 'dist'),
    clean: true,
    assetModuleFilename: 'assets/[name].[hash][ext]',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    new HtmlPlugin({
      template: './index.html',
    }),
    new CopyPlugin({
      patterns: [{ from: 'public', to: '', context: '../' }],
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/index.[contenthash].css',
      chunkFilename: '[id].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          devMode
            ? 'style-loader'
            : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: '../public/',
                },
              },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            targets: devMode
              ? {
                  esmodules: true,
                }
              : '> 5%',
          },
        },
      },
    ],
  },
  devtool: 'eval-cheap-source-map',
  devServer: {
    port: 3000,
    client: {
      progress: true,
    },
  },
};
