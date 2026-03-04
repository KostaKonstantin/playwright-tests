import { test } from "../fixtures/pom-fixtures";
import { faker } from "@faker-js/faker";

test.describe("Dashboard & Core Navigation", () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test("should successfully load the dashboard using global authentication state", async ({
    dashboardPage,
  }) => {
    // Assert that we weren't redirected back to the login page
    await dashboardPage.assertOnDashboard();

    // Assert that the user's specific profile data loaded
    await dashboardPage.assertUserProfileIsVisible();
  });
});

test.describe("PIM - Employee management", () => {
  test("should create a new employee and find it in employee list", async ({
    dashboardPage,
    pimPage,
  }) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const employeeId = faker.number.int({ min: 10000, max: 99999 }).toString();

    await dashboardPage.navigate();
    await dashboardPage.openPIM();

    await pimPage.assertOnPimPage();
    await pimPage.clickAddEmployee();

    await pimPage.createEmployee({
      firstName,
      lastName,
      employeeId,
    });

    await pimPage.assertEmployeeCreated({
      firstName,
      lastName,
      employeeId,
    });

    await pimPage.openEmployeeList();
    await pimPage.searchEmployeeByName(`${firstName} ${lastName}`);

    await pimPage.assertEmployeeVisibleInList(firstName, lastName);
  });
});
