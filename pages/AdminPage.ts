import { Page, Locator, expect } from "@playwright/test";
import { Table } from "../components/Table";
import { selectFirstAutocompleteOption } from "../utils/helpers";

export class AdminPage {
  readonly page: Page;
  readonly table: Table;

  private readonly header: Locator;
  private readonly addButton: Locator;
  private readonly searchButton: Locator;
  private readonly resetButton: Locator;
  private readonly deleteSelectedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = new Table(page);

    this.header = page.getByRole("heading", { name: "System Users" });
    this.addButton = page.getByRole("button", { name: "Add" });
    this.searchButton = page.getByRole("button", { name: "Search" });
    this.resetButton = page.getByRole("button", { name: "Reset" });
    this.deleteSelectedButton = page.getByRole("button", { name: /Delete Selected/i });
  }

  /** Returns the username search filter (first input within the search form). */
  private get usernameFilter(): Locator {
    // The search form is the first oxd-form on the page.
    // Username is the first plain text input in that form.
    return this.page.locator(".oxd-form").first().locator("input.oxd-input").first();
  }

  async navigate() {
    await this.page.goto("/web/index.php/admin/viewSystemUsers");
    await expect(this.header).toBeVisible({ timeout: 10000 });
  }

  async assertOnAdminPage() {
    await expect(this.header).toBeVisible();
  }

  async searchByUsername(username: string) {
    await this.usernameFilter.fill(username);
    await this.searchButton.click();
    await this.page.waitForTimeout(1000);
  }

  async resetSearch() {
    await this.resetButton.click();
    await this.page.waitForTimeout(500);
  }

  async addUser(data: {
    employeeNameHint: string;
    username: string;
    password: string;
    role?: "Admin" | "ESS";
    status?: "Enabled" | "Disabled";
  }) {
    await this.addButton.click();
    await expect(this.page.getByRole("heading", { name: "Add User" })).toBeVisible();

    // ── All locators resolved inline on the Add User page ───────────────────
    // Select BOTH dropdowns FIRST (before autocomplete) to avoid Vue reactivity
    // resetting the employee name field when a subsequent dropdown is changed.
    const selects = this.page.locator(".oxd-select-text");

    // 1. Select User Role
    await selects.nth(0).click();
    await this.page
      .locator(".oxd-select-dropdown .oxd-select-option", { hasText: data.role ?? "ESS" })
      .click();

    // 2. Select Status (before employee autocomplete to prevent field reset)
    await selects.nth(1).click();
    await this.page
      .locator(".oxd-select-dropdown .oxd-select-option", { hasText: data.status ?? "Enabled" })
      .click();

    // 3. Employee Name autocomplete (last, so no subsequent interactions reset it)
    await selectFirstAutocompleteOption(
      this.page,
      this.page.locator(".oxd-autocomplete-text-input input"),
      data.employeeNameHint,
    );

    // Username field is the 3rd textbox globally on the page:
    // [0] sidebar search, [1] employee name ("Type for hints..."), [2] username
    const usernameInput = this.page.getByRole("textbox").nth(2);
    await usernameInput.waitFor({ state: "visible" });
    await usernameInput.fill(data.username);

    // Password fields (type="password")
    const pwInputs = this.page.locator('input[type="password"]');
    await pwInputs.nth(0).fill(data.password);
    await pwInputs.nth(1).fill(data.password);

    await this.page.getByRole("button", { name: "Save" }).click();

    // Wait for successful save – either a toast message or redirect to user list
    await Promise.race([
      this.page.locator(".oxd-toast").waitFor({ state: "visible", timeout: 8000 }),
      this.page.waitForURL(/viewSystemUsers/, { timeout: 8000 }),
    ]).catch(() => {/* ignore – verify in the test itself */});

    // Verify save succeeded (not still on the save form with validation errors)
    await expect(
      this.page.locator(".oxd-input-field-error-message").first(),
    ).toBeHidden({ timeout: 3000 }).catch(() => {
      throw new Error("User creation failed – validation errors visible on form");
    });
  }

  async deleteUser(username: string) {
    await this.navigate();
    await this.searchByUsername(username);
    await this.table.checkRow(username);
    await this.deleteSelectedButton.click();

    const confirmButton = this.page.getByRole("button", { name: "Yes, Delete" });
    await confirmButton.waitFor({ state: "visible" });
    await confirmButton.click();

    // Wait for redirect back to list
    await this.page.waitForTimeout(1500);
  }

  async assertUserExists(username: string) {
    await this.table.assertRowExists(username);
  }

  async assertUserNotExists(username: string) {
    await this.table.assertEmpty();
  }
}
