import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    include: ['src/**/*.integration.test.ts', 'src/**/*.api.test.ts'],
    environment: 'node',
    setupFiles: ['./src/test/integration.setup.ts'],
    globals: true,
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
