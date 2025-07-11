module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm run dev',
      startServerReadyPattern: 'ready in',
      url: ['http://localhost:8083'],
      numberOfRuns: 3,
      settings: {
        throttlingMethod: 'simulate',
      },
      // Budget JSON ensures bundle does not regress perf
      budgets: [
        {
          path: '/',
          resourceSizes: [
            { resourceType: 'script', budget: 300 },
            { resourceType: 'total', budget: 1800 },
          ],
          timings: [
            { metric: 'interactive', budget: 5000 },
            { metric: 'first-contentful-paint', budget: 2500 },
          ],
        },
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