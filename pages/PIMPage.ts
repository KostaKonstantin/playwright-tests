import { Page, Locator, expect } from "@playwright/test";
import { Table } from "../components/Table";
import { selectFirstAutocompleteOption } from "../utils/helpers";

export class PIMPage {
  readonly page: Page;
  readonly table: Table;

  private readonly header: Locator;
  private readonly addEmployeeHeader: Locator;
  private readonly personalDetailsHeader: Locator;
  private readonly addButton: Locator;
  private readonly saveButton: Locator;
  private readonly employeeListTab: Locator;
  private readonly firstNameInput: Locator;
  private readonly middleNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly employeeNameSearchInput: Locator;
  private readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = new Table(page);

    this.header = page.getByRole("heading", { name: /PIM/i });
    this.addEmployeeHeader = page.getByRole("heading", { name: /Add Employee/i });
    this.personalDetailsHeader = page.getByRole("heading", { name: /Personal Details/i });

    this.addButton = page.getByRole("button", { name: "Add" });
    this.saveButton = page.getByRole("button", { name: /^Save$/i });
    this.employeeListTab = page.getByRole("link", { name: /Employee List/i });

    // Named inputs – reliable across Add Employee and Personal Details pages
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.middleNameInput = page.locator('input[name="middleName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');

    // Employee list search autocomplete
    this.employeeNameSearchInput = page
      .locator(".oxd-autocomplete-text-input")
      .locator("input")
      .first();

    this.searchButton = page.getByRole("button", { name: /Search/i });
  }

  /**
   * Returns the Employee ID input scoped to the Add Employee form.
   * Must be called only when on the Add Employee page.
   * Uses position-based nth(4) as per the original working implementation —
   * the form renders: [header search] + [firstName] + [middleName] + [lastName] + [employeeId]
   */
  private get employeeIdInput(): Locator {
    return this.page.locator("input.oxd-input").nth(4);
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
    middleName?: string;
  }) {
    await this.firstNameInput.fill(data.firstName);
    if (data.middleName) {
      await this.middleNameInput.fill(data.middleName);
    }
    await this.lastNameInput.fill(data.lastName);

    // Clear auto-generated ID and fill with the provided value
    await this.employeeIdInput.clear();
    await this.employeeIdInput.fill(data.employeeId);

    await this.saveButton.click();
    await expect(this.personalDetailsHeader).toBeVisible({ timeout: 30000 });
  }

  async assertEmployeeCreated(data: {
    firstName: string;
    lastName: string;
  }) {
    // After save, user lands on Personal Details — verify the redirect and name fields
    await expect(this.personalDetailsHeader).toBeVisible();
    await expect(this.firstNameInput).toHaveValue(data.firstName);
    await expect(this.lastNameInput).toHaveValue(data.lastName);
  }

  async openEmployeeList() {
    await this.employeeListTab.click();
    await expect(this.header).toBeVisible();
  }

  async searchEmployeeByName(name: string) {
    await selectFirstAutocompleteOption(this.page, this.employeeNameSearchInput, name);
    await this.searchButton.click();
    await this.page.waitForTimeout(1200);
  }

  async assertEmployeeVisibleInList(firstName: string, lastName: string) {
    await this.table.assertRowExists(`${firstName} ${lastName}`);
  }

  /** Navigate directly to an employee's profile by empNumber. */
  async navigateToEmployee(empNumber: string) {
    await this.page.goto(`/web/index.php/pim/viewPersonalDetails/empNumber/${empNumber}`);
    await expect(this.personalDetailsHeader).toBeVisible();
  }
}
