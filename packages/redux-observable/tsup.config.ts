import { defineConfig } from 'tsup';

export default defineConfig({
  // Name the entry so emitted files are redux-observable.(mjs|cjs)
  entry: { 'redux-observable': 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: false, // Use tsc for type generation
  clean: true,
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
