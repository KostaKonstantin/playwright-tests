import { test as base, type APIRequestContext } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { PIMPage } from "../pages/PIMPage";
import { AdminPage } from "../pages/AdminPage";
import { LeavePage } from "../pages/LeavePage";
import { OrangeHRMApiClient } from "../utils/apiClient";

type AppFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  pimPage: PIMPage;
  adminPage: AdminPage;
  leavePage: LeavePage;
  apiClient: OrangeHRMApiClient;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  pimPage: async ({ page }, use) => {
    await use(new PIMPage(page));
  },

  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },

  leavePage: async ({ page }, use) => {
    await use(new LeavePage(page));
  },

  apiClient: async ({ request }, use) => {
    await use(new OrangeHRMApiClient(request));
  },
});

export { expect } from "@playwright/test";
