import { defineConfig, Options } from 'tsup';
import fs from 'fs';
import { promisify } from 'util';

export default defineConfig((options) => {
  const commonOptions: Partial<Options> = {
    entry: {
      'redux-observable': 'src/index.ts',
    },
    esbuildPlugins: [],
    sourcemap: true,
    ...options,
  };

  return [
    // Standard ESM, embedded `process.env.NODE_ENV` checks
    {
      ...commonOptions,
      format: ['esm'],
      outExtension: () => ({ js: '.mjs' }),
      dts: true,
      clean: true,
      // Support Webpack 4 by pointing `"module"` to a file with a `.js` extension
      onSuccess: async () => promisify(fs.copyFile)('dist/redux-observable.mjs', 'dist/redux-observable.legacy-esm.js'),
    },
    // Browser-ready ESM, production + minified
    {
      ...commonOptions,
      entry: {
        'redux-observable.browser': 'src/index.ts',
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      format: ['esm'],
      outExtension: () => ({ js: '.mjs' }),
      minify: true,
    },
    {
      ...commonOptions,
      format: 'cjs',
      outDir: './dist/cjs/',
      outExtension: () => ({ js: '.cjs' }),
    },
  ];
});
