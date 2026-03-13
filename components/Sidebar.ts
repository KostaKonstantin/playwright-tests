import { Page, Locator, expect } from "@playwright/test";

type Module =
  | "Admin"
  | "PIM"
  | "Leave"
  | "Time"
  | "Recruitment"
  | "My Info"
  | "Performance"
  | "Dashboard"
  | "Directory"
  | "Maintenance"
  | "Buzz";

/**
 * Reusable sidebar navigation component.
 * All main module navigation should go through this component.
 */
export class Sidebar {
  private readonly nav: Locator;

  constructor(private readonly page: Page) {
    this.nav = page.locator(".oxd-main-menu");
  }

  async navigateTo(module: Module) {
    await this.nav.getByRole("link", { name: module }).click();
    await expect(this.page).toHaveURL(new RegExp(module.toLowerCase().replace(" ", "")), { timeout: 10000 });
  }

  async isVisible() {
    await expect(this.nav).toBeVisible();
  }

  async assertModulesVisible(modules: Module[]) {
    for (const module of modules) {
      await expect(
        this.nav.getByRole("link", { name: module }),
      ).toBeVisible();
    }
  }
}
