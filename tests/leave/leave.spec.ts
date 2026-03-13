import { test, expect } from "../../fixtures/pom-fixtures";
import { generateLeaveRequest } from "../../utils/testData";

test.describe("Leave – Apply & View", { tag: ["@leave", "@regression"] }, () => {
  test("should load the Apply Leave page", { tag: "@smoke" }, async ({
    leavePage,
    page,
  }) => {
    await leavePage.navigateToApply();
    await expect(page).toHaveURL(/applyLeave/);
  });

  test("should load the My Leave List page", { tag: "@smoke" }, async ({
    leavePage,
    page,
  }) => {
    await leavePage.navigateToMyLeave();
    await leavePage.assertOnMyLeavePage();
  });

  test(
    "should apply for annual leave and verify the request appears",
    async ({ leavePage, page }) => {
      await leavePage.navigateToApply();

      // The shared demo resets leave balances; skip gracefully when none exist
      const noBalance = await page
        .getByText("No Leave Types with Leave Balance")
        .isVisible();
      test.skip(noBalance, "Demo account has no leave balance configured – skipping apply test");

      const leaveData = generateLeaveRequest();
      await leavePage.applyLeave(leaveData);

      // Successful submission redirects to My Leave list
      await leavePage.assertLeaveAppliedSuccessfully();
      await leavePage.assertLeaveRequestVisible(leaveData);
    },
  );

  test(
    "should display the My Leave list container",
    async ({ leavePage, page }) => {
      await leavePage.navigateToMyLeave();
      // The table may be empty on a fresh demo — just verify the container loads
      await expect(page.locator(".orangehrm-container").first()).toBeVisible();
    },
  );
});
