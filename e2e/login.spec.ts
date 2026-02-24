import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Title is "Nelax Systems | Simple POS for Small Shops"
    await expect(page).toHaveTitle(/.*Nelax.*/);
    // Check for welcome back text or logo
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    // Check for input fields by placeholder
    await expect(
      page.locator('input[placeholder*="0917"], input[type="email"], input[type="text"]').first()
    ).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /log in|login/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /log in/i }).click();

    // Should show toast error or form validation
    await expect(page.locator('[data-sonner-toast]'))
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // Fallback: check for form validation
        return expect(page.locator('input:invalid').first()).toBeVisible();
      });
  });

  test('should navigate to password reset page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await page.getByRole('link', { name: /forgot password|forgot/i }).click();

    await expect(page).toHaveURL(/.*forgot-password.*/);
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // The link says "Start free trial"
    await page.getByRole('link', { name: /start free trial/i }).click();

    await expect(page).toHaveURL(/.*get-started.*/);
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
