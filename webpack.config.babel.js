import webpack from 'webpack';
import webpackRxjsExternals from 'webpack-rxjs-externals';

const env = process.env.NODE_ENV;

const config = {
  mode: env,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['es2015', { modules: false }]]
          }
        }
      }
    ]
  },
  output: {
    library: 'ReduxObservable',
    libraryTarget: 'umd'
  },
  externals: [
    webpackRxjsExternals(),
    {
      redux: {
        root: 'Redux',
        commonjs2: 'redux',
        commonjs: 'redux',
        amd: 'redux'
      }
    }
  ],
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
};

export default config;
