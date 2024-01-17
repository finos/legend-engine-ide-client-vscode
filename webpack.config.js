const path = require('path');

module.exports = {
  entry: {
    AgGridRenderer: './src/components/AgGridRenderer.tsx',
    // Add more entry points as needed
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'lib', 'components'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // Allow importing CSS modules:
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css'],
  },
};