import { test, expect } from "../../fixtures/pom-fixtures";
import { generateEmployee } from "../../utils/testData";

test.describe("PIM – Employee Management", { tag: ["@pim", "@regression"] }, () => {
  test.beforeEach(async ({ dashboardPage, pimPage, page }) => {
    await dashboardPage.navigate();
    await dashboardPage.sidebar.navigateTo("PIM");
    await pimPage.assertOnPimPage();
  });

  test(
    "should create a new employee and verify on personal details",
    { tag: "@smoke" },
    async ({ pimPage }) => {
      const employee = generateEmployee();

      await pimPage.clickAddEmployee();
      await pimPage.createEmployee(employee);
      await pimPage.assertEmployeeCreated({ firstName: employee.firstName, lastName: employee.lastName });
    },
  );

  test(
    "should find a newly created employee in the employee list",
    async ({ pimPage }) => {
      const employee = generateEmployee();

      // Create
      await pimPage.clickAddEmployee();
      await pimPage.createEmployee(employee);

      // Search in list
      await pimPage.openEmployeeList();
      await pimPage.searchEmployeeByName(`${employee.firstName} ${employee.lastName}`);
      await pimPage.assertEmployeeVisibleInList(employee.firstName, employee.lastName);
    },
  );

  test(
    "should show the Add Employee form when Add button is clicked",
    async ({ pimPage, page }) => {
      await pimPage.clickAddEmployee();
      await expect(page).toHaveURL(/addEmployee/);
    },
  );

  test(
    "should display the employee list page",
    async ({ pimPage, page }) => {
      await expect(page).toHaveURL(/viewEmployeeList/);
      await pimPage.table.assertAtLeastOneResult();
    },
  );
});
