import { test, expect } from "../../fixtures/pom-fixtures";
import { loginErrorScenarios, credentials } from "../../utils/testData";

// Override the global authenticated storage state for this suite
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication", { tag: ["@smoke", "@auth"] }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test("should login successfully with valid credentials", async ({
    loginPage,
    page,
  }) => {
    await loginPage.login(credentials.admin.username, credentials.admin.password);
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should render all critical UI elements on the login page", async ({
    loginPage,
  }) => {
    await loginPage.assertCriticalElementsLoaded();
  });

  test.describe("Invalid credential scenarios", { tag: "@regression" }, () => {
    for (const scenario of loginErrorScenarios) {
      test(`should display error – ${scenario.testCase}`, async ({
        loginPage,
      }) => {
        await loginPage.login(scenario.username, scenario.password);
        await loginPage.assertLoginError(
          scenario.expectedError,
          scenario.errorType,
        );
      });
    }
  });

  test(
    "should match the visual layout of the login page",
    { tag: "@visual" },
    async ({ loginPage, page }) => {
      await loginPage.usernameInput.waitFor({ state: "visible" });
      await expect(page).toHaveScreenshot("login-page-layout.png");
    },
  );
});
