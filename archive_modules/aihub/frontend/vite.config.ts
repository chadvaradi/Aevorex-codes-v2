import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8085,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../../../shared/frontend/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    exclude: ['@shared'],
  },
}); 