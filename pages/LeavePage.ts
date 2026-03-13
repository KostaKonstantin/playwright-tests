import { Page, Locator, expect } from "@playwright/test";
import { Table } from "../components/Table";
import { fillDateInput, waitForLoading, waitForToast } from "../utils/helpers";

export class LeavePage {
  readonly page: Page;
  readonly table: Table;

  private readonly applyHeader: Locator;
  private readonly myLeaveHeader: Locator;
  private readonly applyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = new Table(page);

    this.applyHeader = page.getByRole("heading", { name: "Apply Leave" });
    this.myLeaveHeader = page.getByRole("heading", { name: "My Leave List" });
    this.applyButton = page.getByRole("button", { name: "Apply" });
  }

  async navigateToApply() {
    await this.page.goto("/web/index.php/leave/applyLeave");
    await expect(this.applyHeader).toBeVisible({ timeout: 10000 });
    // Wait for the form loader overlay to disappear before interacting
    await waitForLoading(this.page);
  }

  async navigateToMyLeave() {
    await this.page.goto("/web/index.php/leave/viewMyLeaveList");
    await expect(this.myLeaveHeader).toBeVisible({ timeout: 10000 });
  }

  async applyLeave(data: {
    leaveType: string;
    fromDate: string;
    toDate: string;
    comment?: string;
  }) {
    // ── Locate all form elements inline on the Apply Leave page ─────────────
    // The Apply Leave form has exactly 1 select (Leave Type) and date inputs
    const leaveTypeDropdown = this.page.locator(".oxd-select-text").first();

    // From Date and To Date inputs
    const dateInputs = this.page.locator("input.oxd-input");
    const fromDateInput = dateInputs.nth(1);
    const toDateInput = dateInputs.nth(2);

    // Select leave type
    await leaveTypeDropdown.click();
    await this.page
      .locator(".oxd-select-dropdown .oxd-select-option", { hasText: data.leaveType })
      .click();

    // Fill dates
    await fillDateInput(fromDateInput, data.fromDate);
    await fillDateInput(toDateInput, data.toDate);

    if (data.comment) {
      const commentInput = this.page.locator("textarea.oxd-textarea");
      await commentInput.fill(data.comment);
    }

    await this.applyButton.click();
  }

  async assertLeaveAppliedSuccessfully() {
    // After applying, user is redirected to My Leave list
    await expect(this.myLeaveHeader).toBeVisible({ timeout: 15000 });
  }

  async assertLeaveRequestVisible(data: {
    leaveType: string;
  }) {
    await this.table.assertRowExists(data.leaveType);
  }

  async assertOnMyLeavePage() {
    await expect(this.myLeaveHeader).toBeVisible();
  }
}
