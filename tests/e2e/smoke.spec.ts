import { test, expect } from '@playwright/test';

test.describe('Aevorex Frontend Smoke Suite', () => {

  test.beforeEach(async ({ page }) => {
    // For this smoke test, we assume the server is running
    // and we can visit the root page before each test.
    await page.goto('/');
  });

  test('should render StockPage for AAPL', async ({ page }) => {
    // Navigate to a specific stock page
    await page.goto('/financehub/stock/AAPL');

    // Check for a key element that indicates the page has loaded.
    // This could be the stock header, the company name, etc.
    // Using a generic but plausible selector for the header.
    const stockHeader = page.locator('h1:has-text("Apple Inc.")');
    await expect(stockHeader).toBeVisible({ timeout: 10000 });

    // Check for the analysis bubbles grid
    const analysisGrid = page.locator('div[aria-label="Analysis Bubbles Grid"]');
    await expect(analysisGrid).toBeVisible();
    
    // Check for chat panel
    const chatInput = page.locator('input[placeholder="Ask a follow-up question..."]');
    await expect(chatInput).toBeVisible();

    // Check if the TradingView chart is present (or its container)
    const chartContainer = page.locator('#tradingview_chart_container');
    await expect(chartContainer).toBeVisible();

    // Golden snapshot test
    await expect(page).toHaveScreenshot('stock-page-aapl.png');
  });

  test('should render MacroRatesPage with charts', async ({ page }) => {
    // Navigate to the macro rates page
    await page.goto('/financehub/macro');

    // Check for the page title
    const pageTitle = page.locator('h2:has-text("Macro Economic Rates")');
    await expect(pageTitle).toBeVisible();

    // Check for at least one chart container
    // This assumes charts are rendered within a specific type of container.
    const chartContainer = page.locator('.recharts-wrapper');
    await expect(chartContainer.first()).toBeVisible({ timeout: 10000 });

    // Golden snapshot test
    await expect(page).toHaveScreenshot('macro-rates-page.png');
  });

  test('should handle the Google login flow redirection', async ({ page }) => {
    // This test doesn't perform a full login but checks the initial step.
    
    // Mock the login endpoint to prevent actual redirection to Google
    await page.route('**/api/v1/auth/login', async route => {
      // Respond with a success status but without a redirect
      await route.fulfill({
        status: 200,
        body: 'Login redirect intercepted for testing.',
      });
    });

    // Find a "Login" or "Sign In" button and click it
    const loginButton = page.locator('button:has-text("Sign In")');
    await loginButton.click();

    // Since we mocked the response, the page shouldn't navigate away.
    // We can assert that the URL is still the same or check for a confirmation.
    // For this smoke test, we are just verifying the click action is handled
    // without throwing an error and that our API mock is working.
    await expect(page.locator('body')).toContainText('Login redirect intercepted for testing', { timeout: 5000 });
  });

}); 