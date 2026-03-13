/**
 * Visual regression tests using Playwright's built-in screenshot comparison.
 *
 * First run: snapshots are created automatically (tests pass as "new").
 * Subsequent runs: snapshots are compared against the baseline.
 *
 * To update baselines after intentional UI changes:
 *   npx playwright test --project=visual --update-snapshots
 */

import { test, expect } from "../../fixtures/pom-fixtures";

test.describe("Visual – Login Page", { tag: ["@visual", "@regression"] }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("login page layout matches baseline", async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.usernameInput.waitFor({ state: "visible" });
    await expect(page).toHaveScreenshot("login-page.png", {
      maxDiffPixelRatio: 0.05,
    });
  });
});

test.describe("Visual – Dashboard", { tag: ["@visual", "@regression"] }, () => {
  test("dashboard layout matches baseline", async ({ dashboardPage, page }) => {
    await dashboardPage.navigate();
    await dashboardPage.assertOnDashboard();
    // Mask dynamic elements before snapshot
    await expect(page).toHaveScreenshot("dashboard.png", {
      mask: [
        page.locator(".oxd-userdropdown-name"),
        page.locator(".attendance-summary-widget"),
      ],
      maxDiffPixelRatio: 0.05,
    });
  });
});

test.describe("Visual – Navigation Sidebar", { tag: ["@visual", "@regression"] }, () => {
  test("sidebar navigation matches baseline", async ({ dashboardPage, page }) => {
    await dashboardPage.navigate();
    const sidebar = page.locator(".oxd-main-menu");
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveScreenshot("sidebar.png", {
      maxDiffPixelRatio: 0.05,
    });
  });
});
