import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Check for Nelax in title and main headline
    await expect(page).toHaveTitle(/.*Nelax.*/);
    await expect(page.getByRole('heading', { name: /Manage your shop/i })).toBeVisible();
  });

  test('should navigate to pricing page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Use first() to avoid strict mode violation with footer links
    await page
      .getByRole('navigation')
      .getByRole('link', { name: /pricing/i })
      .first()
      .click();

    await expect(page).toHaveURL(/.*pricing.*/);
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible();
  });

  test('should navigate to how it works page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Click the nav link specifically, not the CTA button
    await page
      .getByRole('navigation')
      .getByRole('link', { name: /how it works/i })
      .first()
      .click();

    await expect(page).toHaveURL(/.*how-it-works.*/);
    await expect(page.getByRole('heading', { name: /how it works/i })).toBeVisible();
  });

  test('should start trial from CTA', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByRole('link', { name: /free trial/i }).click();

    await expect(page).toHaveURL(/.*start-trial|get-started.*/);
  });

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Scope to navigation to avoid conflicts with footer links
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Features' }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: /how it works/i }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Pricing' }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Login' }).first()).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByRole('navigation').getByRole('link', { name: 'Login' }).first().click();

    await expect(page).toHaveURL(/.*login.*/);
  });

  test('footer should be visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('footer')).toBeVisible();
    await expect(page.getByRole('link', { name: /terms/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible();
  });
});
