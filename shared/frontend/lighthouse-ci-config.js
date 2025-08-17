module.exports = {
  ci: {
    collect: {
      // Serve a production preview for SPA routes
      startServerCommand: 'pnpm run build && pnpm run preview -- --port 8083',
      startServerReadyPattern: 'Local',
      url: [
        'http://localhost:8083/stock/AAPL',
        'http://localhost:8083/macro',
        'http://localhost:8083/news',
        'http://localhost:8083/ai-hub',
        'http://localhost:8083/content-hub',
        'http://localhost:8083/healthhub'
      ],
      numberOfRuns: 3,
      settings: {
        throttlingMethod: 'simulate',
        preset: 'desktop',
      },
      // Budget JSON ensures bundle does not regress perf
      budgets: [
        {
          path: '/stock/AAPL',
          resourceSizes: [
            { resourceType: 'script', budget: 300 },
            { resourceType: 'total', budget: 1800 },
          ],
          timings: [
            { metric: 'interactive', budget: 5000 },
            { metric: 'first-contentful-paint', budget: 2500 },
          ],
        },
        { path: '/ai-hub' },
        { path: '/content-hub' },
        { path: '/macro' },
        { path: '/news' },
        { path: '/healthhub' },
      ],
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}; 