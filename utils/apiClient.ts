import { APIRequestContext, expect } from "@playwright/test";

/**
 * Reusable API client wrapping Playwright's APIRequestContext.
 * Provides typed helpers for the OrangeHRM REST API.
 */
export class OrangeHRMApiClient {
  constructor(private readonly request: APIRequestContext) {}

  // ─── Auth ──────────────────────────────────────────────────────────────────

  async login(username: string, password: string) {
    const response = await this.request.post(
      "/web/index.php/auth/validate",
      {
        form: { username, password, _token: "" },
      },
    );
    return response;
  }

  // ─── Employees ────────────────────────────────────────────────────────────

  async getEmployees(params?: Record<string, string>) {
    const query = params ? new URLSearchParams(params).toString() : "";
    const url = `/web/index.php/api/v2/pim/employees${query ? "?" + query : ""}`;
    const response = await this.request.get(url);
    return response;
  }

  async getEmployee(empNumber: number) {
    const response = await this.request.get(
      `/web/index.php/api/v2/pim/employees/${empNumber}`,
    );
    return response;
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async getUsers(params?: Record<string, string>) {
    const query = params ? new URLSearchParams(params).toString() : "";
    const url = `/web/index.php/api/v2/admin/users${query ? "?" + query : ""}`;
    const response = await this.request.get(url);
    return response;
  }

  // ─── Leave ────────────────────────────────────────────────────────────────

  async getLeaveTypes() {
    const response = await this.request.get(
      "/web/index.php/api/v2/leave/leave-types",
    );
    return response;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  async expectSuccess(response: Awaited<ReturnType<APIRequestContext["get"]>>) {
    expect(response.status()).toBeLessThan(300);
    return response.json();
  }

  async expectUnauthorized(response: Awaited<ReturnType<APIRequestContext["get"]>>) {
    expect(response.status()).toBe(401);
  }
}
