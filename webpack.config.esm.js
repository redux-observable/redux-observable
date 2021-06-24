import webpack from 'webpack';
import webpackRxjsExternals from 'webpack-rxjs-externals';

const env = process.env.NODE_ENV;

const config = {
  mode: env,
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'src/tsconfig.json'
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
