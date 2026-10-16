import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Client scripts and the shared locale logic they bundle.
      include: ['src/scripts/**/*.ts', 'src/i18n/**/*.ts'],
      // Entry points only wire the tested modules to the browser globals.
      exclude: ['src/scripts/**/*-entry.ts'],
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
