import { test, expect } from "@playwright/test";

/**
 * This spec exercises the full registration flow end-to-end, which requires
 * a running Postgres instance reachable via DATABASE_URL (see
 * docker-compose.yml). CI should set DATABASE_URL before running
 * `test:e2e`.
 */
test.describe("Registration flow", () => {
  test("a new user can register and land on the dashboard", async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@netwatch.test`;

    await page.goto("/register");
    await page.getByLabel("Name").fill("E2E Test User");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill("e2eTestPassword123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
