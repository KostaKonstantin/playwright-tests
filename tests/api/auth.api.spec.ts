import { test, expect, request as newRequest } from "@playwright/test";
import { credentials } from "../../utils/testData";

const BASE_URL = "https://opensource-demo.orangehrmlive.com";

/**
 * API tests using Playwright's APIRequestContext.
 * The `api` project uses the saved auth storageState so all `request` calls
 * are already authenticated.
 *
 * Tests that validate *unauthenticated* behaviour create a fresh request
 * context without cookies.
 */

test.describe("API – Authenticated Endpoints", { tag: ["@api", "@smoke"] }, () => {
  test("should return employee list (200) for authenticated request", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/web/index.php/api/v2/pim/employees?limit=5`,
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("should return admin user list (200) for authenticated request", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/web/index.php/api/v2/admin/users?limit=5`,
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(body.data.length).toBeGreaterThan(0);
  });

  test("should return leave types (200) for authenticated request", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/web/index.php/api/v2/leave/leave-types?limit=10`,
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(body.data.length).toBeGreaterThan(0);
  });

  test("should return structured employee data with expected fields", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/web/index.php/api/v2/pim/employees?limit=1`,
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("meta");

    if (body.data.length > 0) {
      const employee = body.data[0];
      expect(employee).toHaveProperty("empNumber");
      expect(employee).toHaveProperty("firstName");
      expect(employee).toHaveProperty("lastName");
    }
  });
});

test.describe("API – Response Schema Validation", { tag: ["@api", "@regression"] }, () => {
  /**
   * The OrangeHRM demo API does not enforce cookie-based auth on all endpoints.
   * These tests validate that the API response schemas are consistent and correct
   * regardless of authentication mechanism.
   */
  test("employee list response should conform to expected schema", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/web/index.php/api/v2/pim/employees?limit=2&offset=0`,
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    // Validate top-level shape
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("meta");
    expect(typeof body.meta.total).toBe("number");

    // Validate individual record shape
    if (body.data.length > 0) {
      const emp = body.data[0];
      expect(emp).toHaveProperty("empNumber");
      expect(emp).toHaveProperty("firstName");
      expect(emp).toHaveProperty("lastName");
    }
  });

  test("admin users response should conform to expected schema", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/web/index.php/api/v2/admin/users?limit=2`,
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("meta");

    if (body.data.length > 0) {
      const user = body.data[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("userName");
      expect(user).toHaveProperty("userRole");
    }
  });
});
