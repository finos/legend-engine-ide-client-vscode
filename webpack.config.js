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

const path = require('path');
const webpack = require('webpack');

const webViewConfig = {
  entry: {
    AgGridRenderer: './src/components/grid/AgGridRenderer.tsx',
    FunctionResultsEditorRenderer: './src/components/function/FunctionResultsEditorRenderer.tsx',
    DiagramRendererRoot: './src/components/diagram/DiagramRendererRoot.tsx',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // Allow importing CSS modules:
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
  plugins: [
    new webpack.ProvidePlugin({
           process: 'process/browser',
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
    fallback: {
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      vm: require.resolve("vm-browserify")
    },
    alias: {
      react: path.resolve('./node_modules/react'),
      process: "process/browser"
    }
  },
};

const extensionConfig = {
  target: 'webworker',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode',
    'vscode-languageclient/node': 'vscode-languageclient/node'
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
      react: path.resolve('./node_modules/react')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
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
    ]
  }
};


module.exports = [webViewConfig, extensionConfig]
