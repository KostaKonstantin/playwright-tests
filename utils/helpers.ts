import { Page, Locator, expect } from "@playwright/test";

/**
 * Wait for the OrangeHRM toast/snackbar notification and optionally assert text.
 */
export async function waitForToast(page: Page, expectedText?: string) {
  const toast = page.locator(".oxd-toast-content");
  await expect(toast).toBeVisible({ timeout: 8000 });
  if (expectedText) {
    await expect(toast).toContainText(expectedText);
  }
  return toast;
}

/**
 * Wait for any OrangeHRM loading overlays to disappear.
 * Covers both the global spinner (.oxd-loading-spinner) and the form-level
 * loader (.oxd-form-loader) that blocks clicks on the Apply Leave page.
 */
export async function waitForLoading(page: Page) {
  await page.waitForTimeout(300);
  for (const selector of [".oxd-loading-spinner", ".oxd-form-loader"]) {
    const el = page.locator(selector);
    if (await el.isVisible()) {
      await expect(el).toBeHidden({ timeout: 15000 });
    }
  }
}

/**
 * Select an option from an OXD custom select-dropdown by visible label text.
 */
export async function selectOxdOption(
  page: Page,
  dropdownLocator: Locator,
  optionText: string,
) {
  await dropdownLocator.click();
  // OrangeHRM renders the option list in a portal overlay – wait for it
  const dropdown = page.locator(".oxd-select-dropdown").first();
  await dropdown.waitFor({ state: "visible" });
  await dropdown.locator(".oxd-select-option", { hasText: optionText }).click();
}

/**
 * Fill an OXD date input (YYYY-MM-DD format).
 * OrangeHRM date pickers accept direct keyboard input.
 */
export async function fillDateInput(dateInput: Locator, date: string) {
  await dateInput.clear();
  await dateInput.fill(date);
  await dateInput.press("Tab");
}

/**
 * Select the first suggestion from an OXD autocomplete field.
 *
 * OrangeHRM's autocomplete first renders a "Searching..." placeholder while the
 * API is in-flight.  We must wait for that placeholder to disappear before
 * clicking the real employee option, otherwise we click a non-interactive
 * loading indicator and the field is never populated.
 */
export async function selectFirstAutocompleteOption(
  page: Page,
  inputLocator: Locator,
  searchText: string,
) {
  // Type character-by-character to trigger debounced input events
  await inputLocator.clear();
  await inputLocator.pressSequentially(searchText, { delay: 80 });

  // Wait for the dropdown to appear (may initially show "Searching....")
  const option = page.locator(".oxd-autocomplete-option").first();
  await option.waitFor({ state: "visible", timeout: 12000 });

  // Wait until the loading indicator is gone and real results are shown
  await expect(option).not.toContainText("Searching", { timeout: 10000 });

  // Verify the option is an actual result, not a "no results" placeholder
  const optionText = (await option.textContent()) ?? "";
  if (optionText.toLowerCase().includes("no records") || optionText.trim() === "") {
    throw new Error(
      `Autocomplete returned no valid results for hint "${searchText}". ` +
      `Verify that employees exist in the system.`,
    );
  }

  // Click the real employee option
  await option.click();
}
