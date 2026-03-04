import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly companyLogo: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly globalErrorMessage: Locator;
  readonly inlineFieldError: Locator;
  constructor(page: Page) {
    this.page = page;
    // Using resilient, user-facing locators
    this.companyLogo = page.getByAltText("company-branding");
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.getByText("Forgot your password?");
    this.globalErrorMessage = page.locator(".oxd-alert-content-text");
    this.inlineFieldError = page.locator(".oxd-input-field-error-message");
  }

  async navigate() {
    await this.page.goto("/web/index.php/dashboard/index", {
      waitUntil: "networkidle",
    });

    await this.usernameInput.waitFor({ state: "visible" });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async assertLoginError(
    expectedMessage: string,
    errorType: "global" | "inline",
  ) {
    if (errorType === "global") {
      await expect(this.globalErrorMessage).toHaveText(expectedMessage);
    } else if (errorType === "inline") {
      // Using .first() in case both fields are empty and there are two messages
      await expect(this.inlineFieldError.first()).toHaveText(expectedMessage);
    } else {
      throw new Error(`Unsupported errorType: ${errorType}`);
    }
  }
  async assertCriticalElementsLoaded() {
    await expect.soft(this.companyLogo).toBeVisible();
    await expect.soft(this.usernameInput).toBeVisible();
    await expect.soft(this.passwordInput).toBeVisible();
    await expect.soft(this.loginButton).toBeVisible();
    await expect.soft(this.forgotPasswordLink).toBeVisible();

    await expect.soft(this.usernameInput).toBeEmpty();
    await expect.soft(this.passwordInput).toBeEmpty();
  }
}
