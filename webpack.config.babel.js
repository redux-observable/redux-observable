import webpack from 'webpack';

const env = process.env.NODE_ENV;

const rxRoot = {
  root: 'Rx',
  commonjs: 'Rx',
  commonjs2: 'Rx',
  amd: 'Rx'
};

const rxOperators = {
  root: ['Rx', 'Observable', 'prototype'],
  commonjs: ['Rx', 'Observable', 'prototype'],
  commonjs2: ['Rx', 'Observable', 'prototype'],
  amd: ['Rx', 'Observable', 'prototype']
};

const rxStatic = {
  root: ['Rx', 'Observable'],
  commonjs: ['Rx', 'Observable'],
  commonjs2: ['Rx', 'Observable'],
  amd: ['Rx', 'Observable']
};

const config = {
  bail: true,
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ }
    ]
  },
  output: {
    library: 'ReduxObservable',
    libraryTarget: 'umd'
  },
  externals: {
    'rxjs/Observable': rxRoot,
    'rxjs/Subject': rxRoot,
    'rxjs/Operator': rxRoot,
    'rxjs/operator/map': rxOperators,
    'rxjs/operator/mapTo': rxOperators,
    'rxjs/operator/filter': rxOperators,
    'rxjs/operator/merge': rxOperators,
    'rxjs/operator/switchMap': rxOperators,
    'rxjs/operator/toArray': rxOperators,
    'rxjs/observable/of': rxStatic,
    'rxjs/observable/merge': rxStatic,
    'rxjs/observable/empty': rxStatic,
    redux: {
      root: 'Redux',
      commonjs2: 'redux',
      commonjs: 'redux',
      amd: 'redux'
    }
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
};

if (env === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  );
}

export default config;
