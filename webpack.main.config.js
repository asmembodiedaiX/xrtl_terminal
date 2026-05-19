const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  mode,
  target: 'electron-main',
  entry: './src/main/index.ts',
  output: {
    path: path.resolve(__dirname, 'build/main'),
    filename: 'index.js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'resources'),
          to: path.resolve(__dirname, 'build/resources')
        }
      ]
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^cpu-features$/
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'cpu-features': path.resolve(__dirname, 'src/utils/emptyModule.ts')
    }
  },
  externals: {
    sqlite3: 'commonjs sqlite3',
    ssh2: 'commonjs ssh2',
    keytar: 'commonjs keytar'
  },
  node: {
    __dirname: false,
    __filename: false
  }
};
