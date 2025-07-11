import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, 'src/test-setup.ts')],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
    ],
    coverage: {
      reporter: ['text', 'json', 'lcov'],
      reportsDirectory: 'coverage/unit',
      all: true,
      include: ['src/**/*.{ts,tsx}', '!src/test-setup.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
    },
  },
}); 