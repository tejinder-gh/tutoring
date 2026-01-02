import { expect, test } from '@playwright/test';

test.describe('Student Course Enrollment Flow', () => {
    test('should browse courses and attempt enrollment', async ({ page }) => {
        // 1. Visit Courses Page
        await page.goto('/courses');
        await expect(page).toHaveTitle(/Courses/);

        // 2. Select a course (assuming at least one exists and has a "View" or title link)
        // We'll look for a course card
        const courseCard = page.locator('article').first(); // Adjust selector based on actual UI
        // Or confirm text "Web Development" or similar exists
        // await expect(page.getByText('Popular Courses')).toBeVisible();

        // Click the first course link
        await courseCard.click();

        // 3. Verify Course Detail Page
        await expect(page).toHaveURL(/\/courses\/.+/);
        await expect(page.getByRole('button', { name: /Enroll/i })).toBeVisible();

        // 4. Click Enroll
        // Note: This requires Authentication normally.
        // If not logged in, it should redirect to login.
        await page.getByRole('button', { name: /Enroll/i }).click();

        // Expect redirect to login if not logged in
        // or check for Payment Modal if logged in (we assume fresh state usually not logged in)
        await expect(page).toHaveURL(/login/);

        // Validating the "Happy Path" requires seeding a user and logging in via setup,
        // which is advanced. For this "Contract" test, verifying the public flow -> login gate is a good start.
    });
});
