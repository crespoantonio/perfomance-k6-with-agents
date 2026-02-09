const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'load-test': './src/tests/load-test.ts',
    'stress-test': './src/tests/stress-test.ts',
    'spike-test': './src/tests/spike-test.ts',
    'endurance-test': './src/tests/endurance-test.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  target: 'web',
  externals: [
    function ({ request }, callback) {
      // Externalize k6 built-in modules
      if (/^k6(\/.*)?$/.test(request)) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    },
  ],
  stats: {
    colors: true,
  },
  devtool: 'source-map',
};
