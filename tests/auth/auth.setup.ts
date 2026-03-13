import { test as setup, expect } from "../../fixtures/pom-fixtures";

const authFile = "playwright/.auth/user.json";

setup("authenticate user", async ({ loginPage, page }) => {
  await loginPage.navigate();
  await loginPage.login(
    process.env.ORANGE_USERNAME || "Admin",
    process.env.ORANGE_PASSWORD || "admin123",
  );
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  await page.context().storageState({ path: authFile });
});
