import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

// We use dynamic `import()` inside an async config factory to avoid the
// "ESM-only package loaded via require()" error that occurred when Vite tried
// to bundle the config (see Vite troubleshooting docs). Both plugins are real
// ESM modules, so the `await import()` pattern is the safest cross-env option.

export default defineConfig({
  plugins: [
    react({
      plugins: [['@swc/plugin-styled-components', { displayName: true }]],
    }) as any,
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src'),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8083,
    host: 'localhost',
    strictPort: true,
    hmr: {
      port: 8083,
      clientPort: 8083,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
      },
    },
    watch: {
      ignored: [
        '**/storybook-static/**',
        '**/coverage/**',
        '**/dist/**',
        '**/.nyc_output/**',
        '**/venv/**',
      ],
    },
    fs: {
      strict: true,
    },
  },
  optimizeDeps: {
    entries: ['src/main.tsx'],
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development' ? true : 'hidden',
    chunkSizeWarningLimit: 1000,
  },
}); 