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
    // Dev-only middleware to avoid 404 for /favicon.ico (browsers request it by default)
    {
      name: 'dev-favicon-redirect',
      configureServer(server) {
        server.middlewares.use('/favicon.ico', (_req, res) => {
          res.statusCode = 302;
          res.setHeader('Location', '/vite.svg');
          res.end();
        });
      },
    } as any,
  ],
  esbuild: {
    // Ideiglenesen relaxed TypeScript checking dev módban
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src'),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8083,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
    hmr: {
      port: 8083,
      clientPort: 8083,
    },
    proxy: process.env.VITE_API_BASE_URL
      ? undefined
      : {
          '/api': {
            target: 'http://localhost:8084',
            changeOrigin: true,
            secure: false,
            timeout: 20000,
            headers: { 'Access-Control-Allow-Origin': '*' },
          },
          '/docs': {
            target: 'http://localhost:8084',
            changeOrigin: true,
            secure: false,
          },
          '/redoc': {
            target: 'http://localhost:8084',
            changeOrigin: true,
            secure: false,
          },
        },
    watch: {
      ignored: [
        '**/storybook-static/**',
        '**/coverage/**',
        '**/dist/**',
        '**/.nyc_output/**',
        '**/venv/**',
        '**/archive_modules/**',
        '**/logs/**',
        '**/audits/**',
        '**/docs/**',
        '**/shared/frontend/storybook-static/**',
        '**/shared/frontend/coverage/**',
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
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
}); 