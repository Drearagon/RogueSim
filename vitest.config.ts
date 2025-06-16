import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  test: {
    include: ['tests/**/*.{test,spec}.ts'],
  },
});
