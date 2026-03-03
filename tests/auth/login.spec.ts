import { test, expect } from "../../fixtures/pom-fixtures";
import invalidLoginData from "../../test-data/login-data.json";

// Override the global storage state just for this file (anonymous user)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication Tests", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test("should login successfully with valid credentials", async ({
    loginPage,
    page,
  }) => {
    // Fetching credentials securely from the .env file
    const username = process.env.ORANGE_USERNAME!;
    const password = process.env.ORANGE_PASSWORD!;

    await loginPage.login(username, password);

    // Assert successful redirect
    await expect(page).toHaveURL(/.*dashboard/);
  });

  // Data-Driven Negative Tests
  for (const data of invalidLoginData) {
    test(`should display error for scenario: ${data.testCase}`, async ({
      loginPage,
    }) => {
      // Passes the data directly from the JSON object
      await loginPage.login(data.username, data.password);

      // Asserts the specific error message AND passes the error type
      await loginPage.assertLoginError(
        data.expectedError,
        data.errorType as "global" | "inline",
      );
    });
  }

  test("should render all critical UI elements on the login page", async ({
    loginPage,
  }) => {
    // The test now reads like plain English
    await loginPage.assertCriticalElementsLoaded();
  });

  test("should match the visual layout of the login page", async ({
    loginPage,
    page,
  }) => {
    // Wait for the page to be fully loaded and stable
    await loginPage.usernameInput.waitFor({ state: "visible" });

    // Capture a screenshot and compare it pixel-by-pixel
    await expect(page).toHaveScreenshot("login-page-layout.png");
  });
});
