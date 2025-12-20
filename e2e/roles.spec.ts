import { expect, test } from '@playwright/test';

test.describe('Role Management', () => {
  test('Director can create, update, and delete roles', async ({ page }) => {
    // Login as Director
    await page.goto('/login');
    await page.fill('input[name="email"]', 'director@future-ready.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Navigate to Roles page
    await page.goto('/admin/settings/roles');
    await expect(page).toHaveURL(/\/admin\/settings\/roles/);
    await expect(page.locator('h1')).toContainText('Roles & Permissions');

    // Create Role
    await page.getByRole('button', { name: 'Create Role' }).click();
    await page.fill('input[name="name"]', 'Test Role');
    await page.fill('textarea[name="description"]', 'A test role for E2E');

    // Select first permission (assuming at least one exists)
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'Create Role' }).click();

    // Verify Role Created
    await expect(page.locator('h3', { hasText: 'Test Role' })).toBeVisible();

    // Update Role
    await page.locator('.bg-card', { hasText: 'Test Role' }).getByTitle('Edit Role').click();
    await page.fill('input[name="name"]', 'Updated Test Role');
    await page.getByRole('button', { name: 'Update Role' }).click();

    // Verify Update
    await expect(page.locator('h3', { hasText: 'Updated Test Role' })).toBeVisible();

    // Delete Role
    page.on('dialog', dialog => dialog.accept());
    await page.locator('.bg-card', { hasText: 'Updated Test Role' }).getByTitle('Delete Role').click();

    // Verify Deletion
    await expect(page.locator('h3', { hasText: 'Updated Test Role' })).not.toBeVisible();
  });
});
