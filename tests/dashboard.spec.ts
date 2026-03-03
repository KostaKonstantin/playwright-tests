import { test } from "../fixtures/pom-fixtures";

test.describe("Dashboard & Core Navigation", () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test("should successfully load the dashboard using global authentication state", async ({
    dashboardPage,
  }) => {
    // Assert that we weren't redirected back to the login page
    await dashboardPage.assertOnDashboard();

    // Assert that the user's specific profile data loaded
    await dashboardPage.assertUserProfileIsVisible();
  });
});
