import { test, expect } from '@playwright/test';

test.describe('Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a new task', async ({ page }) => {
    // Navigate to a project page
    await page.goto('/dashboard');
    await page.click('text="Test Project"'); // Assuming a project exists

    // Click on create task button
    await page.click('text="Create Task"');

    // Fill task details
    await page.fill('input[name="title"]', 'New E2E Task');
    await page.fill('textarea[name="description"]', 'Description for E2E Task');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify task is created in the Kanban board or list
    await expect(page.locator('text="New E2E Task"')).toBeVisible();
  });
});
