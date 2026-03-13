import { Page, Locator, expect } from "@playwright/test";

/**
 * Reusable abstraction for the OXD table component used throughout OrangeHRM.
 * Provides row-level access, search-and-find, and action helpers.
 */
export class Table {
  private readonly container: Locator;

  constructor(
    private readonly page: Page,
    containerSelector = ".oxd-table",
  ) {
    this.container = page.locator(containerSelector);
  }

  /** All data rows (excludes the header row). */
  get rows(): Locator {
    return this.container.locator(".oxd-table-row").filter({
      hasNot: this.container.locator(".oxd-table-header"),
    });
  }

  /** Find the first row whose text contains all provided strings. */
  rowContaining(...texts: string[]): Locator {
    let locator = this.container.locator(".oxd-table-row");
    for (const text of texts) {
      locator = locator.filter({ hasText: text });
    }
    return locator.first();
  }

  async assertRowExists(...texts: string[]) {
    await expect(this.rowContaining(...texts)).toBeVisible({ timeout: 10000 });
  }

  async assertRowNotExists(...texts: string[]) {
    await expect(this.rowContaining(...texts)).toBeHidden();
  }

  async assertResultCount(count: number) {
    await expect(this.rows).toHaveCount(count, { timeout: 10000 });
  }

  async assertAtLeastOneResult() {
    await expect(this.rows.first()).toBeVisible({ timeout: 10000 });
  }

  /** Click the action button (by aria-label or title) for a specific row. */
  async clickRowAction(rowTexts: string[], actionLabel: RegExp | string) {
    const row = this.rowContaining(...rowTexts);
    await row.getByRole("button", { name: actionLabel }).click();
  }

  /** Check the checkbox in a specific row. */
  async checkRow(...texts: string[]) {
    const row = this.rowContaining(...texts);
    // OXD checkbox renders an icon overlay that intercepts pointer events;
    // force:true bypasses actionability checks so the native input is toggled.
    await row.locator('input[type="checkbox"]').check({ force: true });
  }

  /** Assert that the "No Records Found" empty-state message is shown. */
  async assertEmpty() {
    await expect(this.page.getByText("No Records Found").first()).toBeVisible({ timeout: 10000 });
  }

  /** Get the number of visible rows. */
  async getRowCount(): Promise<number> {
    return this.rows.count();
  }
}
