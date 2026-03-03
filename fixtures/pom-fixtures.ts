import { test as base } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";

type MyFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    // Set up the fixture
    const loginPage = new LoginPage(page);

    // Use the fixture in the test
    await use(loginPage);

    // Teardown can go here if needed
  },
});

export { expect } from "@playwright/test";
