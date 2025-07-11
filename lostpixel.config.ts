import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  // Page screenshots mode for testing full pages
  pageShots: {
    pages: [
      { path: '/', name: 'homepage' },
      { path: '/macro-rates', name: 'macro-rates-page' },
      { path: '/stock/AAPL', name: 'stock-page-aapl' },
      { path: '/stock/MSFT', name: 'stock-page-msft' },
    ],
    baseUrl: 'http://localhost:5179',
  },

  // Storybook integration (will be enabled when Storybook is ready)
  // storybook: {
  //   storybookUrl: 'http://localhost:6006',
  // },

  // Configuration options
  lostPixelProjectId: 'aevorex-financehub',
  
  // Comparison settings
  threshold: 0.1, // 0.1% difference threshold
  
  // Browser settings
  browser: 'chromium',
  
  // Mask dynamic elements
  mask: [
    { selector: '[data-testid="ticker-tape"]' }, // Mask animated ticker tape
    { selector: '[data-testid="chart-container"]' }, // Mask TradingView charts
    { selector: '[data-testid="timestamp"]' }, // Mask timestamps
  ],

  // Wait for network to be idle before taking screenshots
  waitBeforeScreenshot: 2000,

  // Generate images in multiple breakpoints
  breakpoints: [
    { width: 1200, height: 800, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' },
  ],

  // Output directory
  imagePathBaseline: '.lostpixel/baseline/',
  imagePathCurrent: '.lostpixel/current/',
  imagePathDifference: '.lostpixel/difference/',

  // Fail on layout shift
  failOnLayoutShift: true,

  // Generate only changed images
  generateOnly: false,

  // CI integration
  ci: {
    build: 'pnpm build',
    serve: 'pnpm preview --port 5179',
  },
}; 