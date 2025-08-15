import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/*-spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      all: true,
    },
  },
});
