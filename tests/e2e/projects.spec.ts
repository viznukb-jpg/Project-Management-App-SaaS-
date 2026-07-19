import { test, expect } from '@playwright/test';

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming login is required. Replace with actual login steps or use state.
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a new project', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on create project button
    await page.click('text="Create Project"');

    // Fill project details
    await page.fill('input[name="name"]', 'New E2E Project');
    await page.fill(
      'textarea[name="description"]',
      'Description for E2E Project'
    );

    // Submit form
    await page.click('button[type="submit"]');

    // Verify project is created
    await expect(page.locator('text="New E2E Project"')).toBeVisible();
  });
});
