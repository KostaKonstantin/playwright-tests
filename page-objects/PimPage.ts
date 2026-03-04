import { Page, Locator, expect } from "@playwright/test";

export class PimPage {
  readonly page: Page;

  // Headers
  private readonly header: Locator;
  private readonly addEmployeeHeader: Locator;
  private readonly personalDetailsHeader: Locator;

  // Buttons / Navigation
  private readonly addButton: Locator;
  private readonly saveButton: Locator;
  private readonly employeeListTab: Locator;

  // Form fields
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly employeeIdInput: Locator;

  // Search
  private readonly employeeSearchInput: Locator;
  private readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page.getByRole("heading", { name: /PIM/i });
    this.addEmployeeHeader = page.getByRole("heading", {
      name: /Add Employee/i,
    });
    this.personalDetailsHeader = page.getByRole("heading", {
      name: /Personal Details/i,
    });

    this.addButton = page.getByRole("button", { name: /Add/i });
    this.saveButton = page.getByRole("button", { name: /^Save$/i });
    this.employeeListTab = page.getByRole("link", { name: /Employee List/i });

    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.employeeIdInput = page.locator("input.oxd-input").nth(4);

    this.employeeSearchInput = page
      .getByRole("textbox", { name: "Type for hints..." })
      .first();

    this.searchButton = page.getByRole("button", { name: /Search/i });
  }

  async assertOnPimPage() {
    await expect(this.header).toBeVisible();
  }

  async clickAddEmployee() {
    await this.addButton.click();
    await expect(this.addEmployeeHeader).toBeVisible();
  }

  async createEmployee(data: {
    firstName: string;
    lastName: string;
    employeeId: string;
  }) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);

    await this.employeeIdInput.fill("");
    await this.employeeIdInput.fill(data.employeeId);

    await Promise.all([
      this.personalDetailsHeader.waitFor({ state: "visible" }),
      this.saveButton.click(),
    ]);
  }

  async assertEmployeeCreated(data: {
    firstName: string;
    lastName: string;
    employeeId: string;
  }) {
    await expect(this.personalDetailsHeader).toBeVisible();
    await expect(this.firstNameInput).toHaveValue(data.firstName);
    await expect(this.lastNameInput).toHaveValue(data.lastName);
    await expect(this.employeeIdInput).toHaveValue(data.employeeId);
  }

  async openEmployeeList() {
    await this.employeeListTab.click();
  }

  async searchEmployeeByName(name: string) {
    await this.employeeSearchInput.fill(name);

    const suggestion = this.page.locator(".oxd-autocomplete-option").first();

    await suggestion.waitFor();
    await suggestion.click();

    await this.searchButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async assertEmployeeVisibleInList(firstName: string, lastName: string) {
    const row = this.page.locator(".oxd-table-row").filter({
      hasText: `${firstName} ${lastName}`,
    });

    await expect(row).toBeVisible();
  }
}
