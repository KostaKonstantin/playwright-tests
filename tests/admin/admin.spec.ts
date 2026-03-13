import { test, expect } from "../../fixtures/pom-fixtures";
import { generateSystemUser } from "../../utils/testData";

test.describe("Admin – User Management", { tag: ["@admin", "@regression"] }, () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.navigate();
  });

  test("should load the System Users page", { tag: "@smoke" }, async ({
    adminPage,
    page,
  }) => {
    await adminPage.assertOnAdminPage();
    await expect(page).toHaveURL(/viewSystemUsers/);
  });

  test("should display at least one user in the list", async ({ adminPage }) => {
    await adminPage.table.assertAtLeastOneResult();
  });

  test("should search for the Admin user by username", async ({
    adminPage,
  }) => {
    await adminPage.searchByUsername("Admin");
    await adminPage.assertUserExists("Admin");
  });

  test("should reset search and show full user list", async ({ adminPage }) => {
    await adminPage.searchByUsername("Admin");
    await adminPage.resetSearch();
    await adminPage.table.assertAtLeastOneResult();
  });

  test(
    "should add a new ESS user and verify it appears in the list",
    { tag: "@smoke" },
    async ({ adminPage }) => {
      const user = generateSystemUser({ role: "ESS" });

      await adminPage.addUser({
        employeeNameHint: "a", // type 'a' to get first matching employee
        username: user.username,
        password: user.password,
        role: user.role,
        status: user.status,
      });

      await adminPage.navigate();
      await adminPage.searchByUsername(user.username);
      await adminPage.assertUserExists(user.username);

      // Cleanup – delete the created user
      await adminPage.deleteUser(user.username);
    },
  );

  test(
    "should show no results for a non-existent username",
    async ({ adminPage }) => {
      await adminPage.searchByUsername("__nonexistent_user_xyz__");
      await adminPage.table.assertEmpty();
    },
  );
});
