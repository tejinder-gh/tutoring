import { expect, test } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("Login page should load and allow navigation to Register", async ({ page }) => {
    // 1. Visit Login Page
    await page.goto("/login");

    // 2. Check localized title (assuming English default)
    // Note: Adjust selector based on actual localized text structure
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    // 3. Check for Email and Password fields
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    // 4. Verify "Register" link exists (often in 'Don't have an account?' section)
    const registerLink = page.getByRole("link", { name: "Register" });
    await expect(registerLink).toBeVisible();
  });

  test("Protected pages redirect to login", async ({ page }) => {
    await page.goto("/admin");
    // Should be redirected to /login or /api/auth/signin
    await expect(page).toHaveURL(/login/);
  });
});
