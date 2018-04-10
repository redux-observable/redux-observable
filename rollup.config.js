import { join } from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';

import pkg from './package.json';

const isProd = process.env.NODE_ENV === 'production';

const fileName = str => str.replace('.js', isProd ? '.min.js' : '.js');

const BABEL_CONFIG = {
  babelrc: false,
  presets: [
    [
      'env', {
        modules: false,
        targets: {
          browsers: ['last 2 versions'],
        },
      },
    ],
  ],
  plugins: [
    'external-helpers',
    'transform-object-rest-spread',
  ],
  exclude: 'node_modules/**',
};

export default [
  {
    input: join(__dirname, 'src/index.js'),
    output: [
      {
        file: fileName(pkg.main),
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: fileName(pkg.module),
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      babel(BABEL_CONFIG),
      isProd && uglify(),
    ].filter(Boolean),
    external: ['rxjs', 'rxjs/operators', 'redux'],
  },
  {
    input: join(__dirname, 'src/index.js'),
    output: [
      {
        file: fileName(pkg.browser),
        format: 'umd',
        name: 'ReduxObservable',
        globals: {
          rxjs: 'rxjs',
          'rxjs/operators': 'rxjs.operators',
        },
      },
    ],
    plugins: [
      nodeResolve({ jsnext: true }),
      babel(BABEL_CONFIG),
      replace({
        'process.env.NODE_ENV': JSON.stringify('process.env.NODE_ENV'),
      }),
      isProd && uglify(),
    ].filter(Boolean),
    external: ['rxjs', 'rxjs/operators', 'redux'],
  },
];
