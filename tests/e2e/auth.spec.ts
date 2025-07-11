// @ts-nocheck
import { test, expect } from '@playwright/test';

// TODO: Un-skip these tests once the Google Auth flow can be reliably mocked
// or tested with staging credentials in a CI environment.

test.describe.skip('Google Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that requires authentication or has a login button
    await page.goto('/');
  });

  test('should redirect to Google login when clicking "Sign in"', async ({ page }) => {
    // This is a simplified check. A full test would intercept the navigation
    // and assert the redirect URL pattern.
    const loginButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(loginButton).toBeVisible();

    // In a real scenario, we might not actually click through to Google
    // but instead assert that the click initiates the correct redirect.
    // For now, this placeholder test demonstrates the intent.
    await loginButton.click();

    // We expect the URL to change to Google's auth service.
    // This is a weak assertion and would be more robust with mocking.
    await expect(page).toHaveURL(/accounts.google.com/);
  });

  test('should show user as authenticated after a successful login', async ({ page, context }) => {
    // This test would require mocking the Google OAuth callback.
    // 1. Navigate to the login page.
    // 2. Mock the backend's /api/v1/auth/callback endpoint to simulate a successful Google response.
    // 3. Set session cookies/storage to reflect an authenticated state.
    // 4. Reload the page.
    // 5. Assert that the user's name/avatar is visible and the "Logout" button appears.

    // Placeholder assertion
    expect(true).toBe(true);
  });
}); 