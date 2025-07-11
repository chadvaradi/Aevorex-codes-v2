import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react() as any, tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['shared/frontend/src/test-setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**', // Exclude Playwright E2E tests
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'shared/frontend/src'),
      '@shared': path.resolve(__dirname, 'shared/frontend/src'),
      '@ui': path.resolve(__dirname, 'shared/frontend/src/components/ui'),
    },
  },
}); 