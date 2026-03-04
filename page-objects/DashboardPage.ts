import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly headerTitle: Locator;
  readonly userProfileDropdown: Locator;
  readonly pimLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Using accessible locators where possible
    this.headerTitle = page.getByRole("heading", { name: "Dashboard" });
    // Falling back to a stable class for the user profile name
    this.userProfileDropdown = page.locator(".oxd-userdropdown-name");

    this.pimLink = page.getByRole("link", { name: "PIM" });
  }

  async navigate() {
    // Navigating directly to the protected route
    await this.page.goto("/web/index.php/dashboard/index");
  }

  async assertOnDashboard() {
    // Validating both the URL and the critical UI element
    await expect(this.page).toHaveURL(/.*dashboard/);
    await expect(this.headerTitle).toBeVisible();
  }

  async assertUserProfileIsVisible() {
    await expect(this.userProfileDropdown).toBeVisible();
  }

  async openPIM() {
    await this.pimLink.click();
  }
}
