import { test, expect } from "../../fixtures/pom-fixtures";
import invalidLoginData from "../../test-data/login-data.json";

test.describe("Authentication Engine", () => {
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

      // Asserts the specific error message defined for that scenario
      await loginPage.assertLoginError(data.expectedError);
    });
  }
});
