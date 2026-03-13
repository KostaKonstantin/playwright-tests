import { test, expect } from "../../fixtures/pom-fixtures";

test.describe("Dashboard", { tag: ["@smoke", "@dashboard"] }, () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test("should load the dashboard after authenticated session", async ({
    dashboardPage,
  }) => {
    await dashboardPage.assertOnDashboard();
    await dashboardPage.assertUserProfileIsVisible();
  });

  test("should display key dashboard widgets", { tag: "@regression" }, async ({
    dashboardPage,
  }) => {
    await dashboardPage.assertDashboardWidgetsVisible();
  });

  test(
    "should display navigation sidebar with core modules",
    { tag: "@regression" },
    async ({ dashboardPage }) => {
      await dashboardPage.sidebar.assertModulesVisible([
        "Admin",
        "PIM",
        "Leave",
        "Dashboard",
      ]);
    },
  );

  test(
    "should navigate to PIM module from sidebar",
    { tag: "@regression" },
    async ({ dashboardPage, page }) => {
      await dashboardPage.sidebar.navigateTo("PIM");
      await expect(page).toHaveURL(/pim/);
    },
  );

  test(
    "should navigate to Admin module from sidebar",
    { tag: "@regression" },
    async ({ dashboardPage, page }) => {
      await dashboardPage.sidebar.navigateTo("Admin");
      await expect(page).toHaveURL(/admin/);
    },
  );
});
