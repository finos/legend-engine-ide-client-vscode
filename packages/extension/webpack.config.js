/**
 * Copyright (c) 2023-present, Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { type } = require('os');
const path = require('path');
const webpack = require('webpack');

const webviewConfig = {
  entry: {
    // AgGridRenderer:
    //   '@finos/legend-engine-ide-client-vscode/AgGridRenderer',
    // FunctionResultsEditorRenderer:
    //   '@finos/legend-engine-ide-client-vscode/FunctionResultsEditorRenderer',
    WebViewRoot:
      '../client/src/components/WebViewRoot.tsx',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: 'assets/[hash][ext][query]',
  },
  devtool: 'nosources-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s?(a|c)ss$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset',
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      AG_GRID_LICENSE: null,
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      vm: require.resolve('vm-browserify'),
    },
    alias: {
      react: path.resolve(__dirname, '../../node_modules/react'),
      process: 'process/browser',
    },
  },
};

const purebookRendererConfig = {
  entry: {
    PurebookRendererRoot:
      '@finos/legend-engine-ide-client-vscode/src/purebook/PurebookRendererRoot.tsx',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  target: 'web',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'module',
    assetModuleFilename: 'assets/[hash][ext][query]',
  },
  experiments: {
    outputModule: true,
  },
  devtool: 'nosources-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s?(a|c)ss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset',
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      AG_GRID_LICENSE: null,
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      vm: require.resolve('vm-browserify'),
    },
    alias: {
      react: path.resolve(__dirname, '../../node_modules/react'),
      process: 'process/browser.js',
    },
  },
};

const extensionConfig = {
  target: 'webworker',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  devtool: 'nosources-source-map',
  externals: {
    vscode: 'commonjs vscode',
    'vscode-languageclient/node': 'vscode-languageclient/node',
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
    fallback: {
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      console: require.resolve('console-browserify'),
      assert: require.resolve('assert'),
    },
    alias: {
      react: path.resolve(__dirname, '../../node_modules/react'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        // include: [
        //   path.resolve(__dirname, 'src'),
        //   path.resolve(__dirname, '../shared/src'),
        // ],
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.s?(a|c)ss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
};

module.exports = [extensionConfig, webviewConfig];
