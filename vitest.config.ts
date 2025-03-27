// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@bitCoinChart': path.resolve(__dirname, 'src/bitCoinChart'),
      '@stopwatch': path.resolve(__dirname, 'src/stopwatch'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@style': path.resolve(__dirname, 'src/style'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
