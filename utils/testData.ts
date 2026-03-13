import { faker } from "@faker-js/faker";

// ─── Credentials ────────────────────────────────────────────────────────────

export const credentials = {
  admin: {
    username: process.env.ORANGE_USERNAME || "Admin",
    password: process.env.ORANGE_PASSWORD || "admin123",
  },
  invalidPassword: {
    username: "Admin",
    password: "wrongpassword123",
  },
  emptyUsername: {
    username: "",
    password: "admin123",
  },
};

// ─── Login Error Scenarios (replaces test-data/login-data.json) ─────────────

export const loginErrorScenarios = [
  {
    testCase: "Invalid Password",
    username: credentials.invalidPassword.username,
    password: credentials.invalidPassword.password,
    expectedError: "Invalid credentials",
    errorType: "global" as const,
  },
  {
    testCase: "Empty Username",
    username: credentials.emptyUsername.username,
    password: credentials.emptyUsername.password,
    expectedError: "Required",
    errorType: "inline" as const,
  },
];

// ─── Employee ────────────────────────────────────────────────────────────────

export function generateEmployee() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    // Employee IDs must be numeric and typically 4-9 digits in OrangeHRM
    employeeId: faker.number.int({ min: 10000, max: 99999 }).toString(),
  };
}

// ─── System User ─────────────────────────────────────────────────────────────

export function generateSystemUser(overrides?: { role?: "Admin" | "ESS" }) {
  return {
    username: `qa_${faker.internet.username().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10)}_${faker.number.int({ min: 100, max: 999 })}`,
    password: "Test@12345",
    role: overrides?.role ?? ("ESS" as const),
    status: "Enabled" as const,
  };
}

// ─── Leave ───────────────────────────────────────────────────────────────────

export function generateLeaveRequest() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() + 7); // 1 week from now

  const to = new Date(from);
  to.setDate(from.getDate() + 1); // 2-day leave

  const formatDate = (d: Date) =>
    d.toISOString().split("T")[0]; // YYYY-MM-DD

  return {
    leaveType: "Annual Leave",
    fromDate: formatDate(from),
    toDate: formatDate(to),
    comment: `Automated test leave - ${faker.lorem.words(3)}`,
  };
}
