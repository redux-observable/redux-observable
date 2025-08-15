import { defineConfig } from 'tsup';

export default defineConfig({
  // Name the entry so emitted files are redux-observable.(mjs|cjs|d.ts)
  entry: { 'redux-observable': 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  // For libraries, prefer single-file outputs per format
  splitting: false,
  minify: true,
  sourcemap: true,
  treeshake: true,
  esbuildOptions(options) {
    options.target = 'es2020';
    options.platform = 'neutral';
  },
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  },
});
