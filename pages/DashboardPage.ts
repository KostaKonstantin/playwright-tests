import { Page, Locator, expect } from "@playwright/test";
import { Sidebar } from "../components/Sidebar";

export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Sidebar;
  private readonly headerTitle: Locator;
  private readonly userProfileDropdown: Locator;

  // Dashboard widgets
  private readonly timeAtWorkWidget: Locator;
  private readonly myActionsWidget: Locator;
  private readonly quickLaunchWidget: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = new Sidebar(page);
    this.headerTitle = page.getByRole("heading", { name: "Dashboard" });
    this.userProfileDropdown = page.locator(".oxd-userdropdown-name");
    this.timeAtWorkWidget = page.getByText("Time at Work");
    this.myActionsWidget = page.getByText("My Actions");
    this.quickLaunchWidget = page.getByText("Quick Launch");
  }

  async navigate() {
    await this.page.goto("/web/index.php/dashboard/index");
    await this.headerTitle.waitFor({ state: "visible" });
  }

  async assertOnDashboard() {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.headerTitle).toBeVisible();
  }

  async assertUserProfileIsVisible() {
    await expect(this.userProfileDropdown).toBeVisible();
  }

  async assertDashboardWidgetsVisible() {
    await expect.soft(this.timeAtWorkWidget).toBeVisible();
    await expect.soft(this.myActionsWidget).toBeVisible();
    await expect.soft(this.quickLaunchWidget).toBeVisible();
  }

  /** Navigate to any module via the sidebar. */
  async openModule(module: Parameters<Sidebar["navigateTo"]>[0]) {
    await this.sidebar.navigateTo(module);
  }
}
