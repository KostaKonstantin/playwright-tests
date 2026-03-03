import { test as base } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";
import { DashboardPage } from "../page-objects/DashboardPage";

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from "@playwright/test";
