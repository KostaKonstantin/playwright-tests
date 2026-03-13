import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env", quiet: true });

export default defineConfig({
  testDir: "./tests",

  // ─── Parallelism ──────────────────────────────────────────────────────────
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,

  // ─── Reporting ────────────────────────────────────────────────────────────
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
    ["allure-playwright", { detail: true, outputFolder: "allure-results" }],
  ],

  // ─── Global test options ──────────────────────────────────────────────────
  use: {
    baseURL:
      process.env.BASE_URL ?? "https://opensource-demo.orangehrmlive.com",

    // Capture trace on first retry — viewable in playwright-report
    trace: "on-first-retry",

    // Screenshot on test failure only
    screenshot: "only-on-failure",

    // Video recording on first retry
    video: "on-first-retry",

    // Generous timeouts for the demo site
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // ─── Global timeouts ─────────────────────────────────────────────────────
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  // ─── Projects ─────────────────────────────────────────────────────────────
  projects: [
    // Runs once, saves authenticated session to disk
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Main UI test suite – runs with pre-authenticated browser context
    {
      name: "chromium",
      testMatch: /tests\/(auth|dashboard|pim|admin|leave)\/.+\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    // API tests – uses stored auth cookies so authenticated endpoints work
    {
      name: "api",
      testMatch: /tests\/api\/.+\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    // Visual regression – separate project, excluded from default CI run
    // Run with: npx playwright test --project=visual
    // Update baselines: npx playwright test --project=visual --update-snapshots
    {
      name: "visual",
      testMatch: /tests\/visual\/.+\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
