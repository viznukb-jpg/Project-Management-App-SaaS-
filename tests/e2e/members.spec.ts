import { test, expect } from '@playwright/test';

test.describe('Members', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should invite a user', async ({ page }) => {
    // Navigate to workspace settings
    await page.goto('/dashboard/settings');
    await page.click('text="Members"');

    // Fill invite form
    await page.fill(
      'input[placeholder="User email address"]',
      'newuser@example.com'
    );
    await page.click('button:has-text("Role")'); // Open select dropdown
    await page.click('text="Member"'); // Select role

    // Submit form
    await page.click('button:has-text("Invite")');

    // Verify user is invited (success toast or appearing in list)
    await expect(
      page.locator('text="Member invited successfully"')
    ).toBeVisible();
  });
});
