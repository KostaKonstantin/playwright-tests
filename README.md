# OrangeHRM Playwright Automation Framework

A portfolio-grade end-to-end automation framework built with **Playwright + TypeScript**, targeting the [OrangeHRM open-source demo](https://opensource-demo.orangehrmlive.com). The framework demonstrates senior QA engineering practices: Page Object Model, reusable components, data-driven testing, API testing, visual regression, and a full CI/CD pipeline with Allure reporting.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Decisions](#architecture-decisions)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Test Coverage](#test-coverage)
- [Reporting](#reporting)

---

## Tech Stack

| Tool | Version | Role |
|---|---|---|
| [Playwright](https://playwright.dev) | ^1.58 | Browser automation + API testing |
| TypeScript | via Playwright | Type safety across all test code |
| [Allure](https://allurereport.org) | ^3.6 | Rich test reporting |
| [Faker.js](https://fakerjs.dev) | ^10 | Randomised test data generation |
| GitHub Actions | — | CI/CD with matrix parallelisation |

---

## Project Structure

```
playwright-tests/
│
├── .github/workflows/
│   └── playwright.yml        # CI pipeline (matrix: chromium + api, Allure merge)
│
├── config/
│   └── env.ts                # Typed environment wrapper; throws on missing secrets
│
├── components/               # Reusable UI abstractions shared across page objects
│   ├── Sidebar.ts            # Side-panel navigation helper
│   └── Table.ts              # OXD table: row queries, checkbox, empty-state assertion
│
├── fixtures/
│   └── pom-fixtures.ts       # Custom Playwright fixture that injects page objects
│
├── pages/                    # One class per application page (Page Object Model)
│   ├── AdminPage.ts          # System Users: add, search, delete
│   ├── DashboardPage.ts      # Dashboard widgets and quick-launch links
│   ├── LeavePage.ts          # Apply Leave and My Leave List
│   ├── LoginPage.ts          # Authentication flows
│   └── PIMPage.ts            # Employee creation and search
│
├── tests/
│   ├── auth/
│   │   ├── auth.setup.ts     # Runs once; saves session → playwright/.auth/user.json
│   │   └── login.spec.ts     # Login happy-path, error scenarios, visual snapshot
│   ├── admin/
│   │   └── admin.spec.ts     # CRUD: add user, search, delete, empty-state
│   ├── dashboard/
│   │   └── dashboard.spec.ts # Widget and navigation smoke tests
│   ├── pim/
│   │   └── pim.spec.ts       # Employee lifecycle: create → verify → find in list
│   ├── leave/
│   │   └── leave.spec.ts     # Apply for leave, My Leave List
│   ├── api/
│   │   └── auth.api.spec.ts  # Authenticated REST endpoints + schema validation
│   └── visual/
│       └── visual.spec.ts    # Screenshot regression for login and dashboard
│
├── utils/
│   ├── apiClient.ts          # Typed wrapper around Playwright's APIRequestContext
│   ├── helpers.ts            # OrangeHRM interaction utilities (autocomplete, dates, loading)
│   └── testData.ts           # Typed test data: credentials, generators for employees/users/leave
│
├── playwright.config.ts      # Four projects: setup → chromium / api / visual
├── .env.example              # Template for required environment variables
└── package.json              # npm scripts for every run mode
```

---

## Architecture Decisions

### Why Page Object Model?

Each page object encapsulates its own locators and actions. Tests read like plain English (`await adminPage.addUser(...)`) and break in one place when the UI changes — not scattered across dozens of test files.

### Why a custom Playwright fixture?

`fixtures/pom-fixtures.ts` extends Playwright's `base` test with typed page-object properties (`adminPage`, `pimPage`, `apiClient`, etc.). This means:

- Tests declare only the objects they need — unused ones are never instantiated.
- No test file ever calls `new AdminPage(page)` directly; dependency injection handles it.
- The fixture composes cleanly with Playwright's built-in `page`, `request`, and `storageState`.

### Why a shared `components/` layer?

The `Table` and `Sidebar` classes appear on almost every OrangeHRM page. Extracting them means a change to the OXD table markup is fixed in one file, not in every page object that touches a table.

### Why TypeScript generators instead of JSON fixtures?

`utils/testData.ts` uses `faker` to produce unique values at runtime (`generateEmployee()`, `generateSystemUser()`, `generateLeaveRequest()`). This avoids:

- Stale fixture data causing uniqueness conflicts on a shared demo server.
- Brittle hardcoded names that break when the demo resets.

### Why `storageState` for authentication?

The `auth.setup.ts` project logs in once and saves the browser session to `playwright/.auth/user.json`. Every subsequent test loads that state rather than logging in via the UI, which:

- Eliminates login flakiness from the test results.
- Cuts 4–6 seconds from every test's runtime.
- Keeps auth tests isolated in `login.spec.ts` where they belong.

### Why four Playwright projects?

| Project | Matches | Depends on | Purpose |
|---|---|---|---|
| `setup` | `*.setup.ts` | — | Creates the shared auth session |
| `chromium` | `tests/{auth,admin,pim,leave,dashboard}/**` | `setup` | UI end-to-end tests |
| `api` | `tests/api/**` | `setup` | REST API tests with authenticated context |
| `visual` | `tests/visual/**` | `setup` | Screenshot regression (excluded from default CI run) |

Separating API and UI tests into different projects means they run in parallel in CI and have independent retry counts.

### OrangeHRM-specific findings

The OXD component library has some non-obvious automation behaviours worth documenting:

- **Autocomplete** renders a `"Searching...."` placeholder (`oxd-autocomplete-option`) while the API is in-flight. Clicking it does nothing. `selectFirstAutocompleteOption` in `helpers.ts` waits for `expect(option).not.toContainText("Searching")` before clicking the real result.
- **Custom checkboxes** render an `<i>` icon on top of the native `<input>` that intercepts pointer events. `Table.checkRow` uses `check({ force: true })` to bypass this.
- **Apply Leave** shows an `oxd-form-loader` overlay while fetching entitlements. `waitForLoading` covers both the global spinner and this form-level overlay.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18 (LTS recommended)
- npm ≥ 9

### Install

```bash
git clone <repo-url>
cd playwright-tests
npm ci
npx playwright install --with-deps chromium
```

### Configure credentials

```bash
cp .env.example .env
```

The default values in `.env.example` are the public credentials for the OrangeHRM demo — no changes needed unless you are targeting a different instance.

```env
ORANGE_USERNAME=Admin
ORANGE_PASSWORD=admin123
```

---

## Running Tests

| Command | What it runs |
|---|---|
| `npm test` | Full suite: chromium UI + API (30 tests) |
| `npm run test:smoke` | `@smoke`-tagged tests only (~12 tests) |
| `npm run test:regression` | `@regression`-tagged UI tests |
| `npm run test:api` | API project only |
| `npm run test:admin` | Admin module only |
| `npm run test:pim` | PIM module only |
| `npm run test:leave` | Leave module only |
| `npm run test:visual` | Visual regression (requires baselines — see below) |
| `npm run test:visual:update` | Create or refresh visual baselines |
| `npm run test:ui` | Playwright interactive UI mode |
| `npm run test:headed` | Headed browser (useful for debugging) |
| `npm run test:debug` | Step-through debugger |
| `npm run report:html` | Open the last Playwright HTML report |

### First-time visual baselines

Visual tests fail until baselines exist. Run once to create them, then commit the snapshots:

```bash
npm run test:visual:update
git add tests/visual/*.png
git commit -m "chore: add visual regression baselines"
```

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on every push to `main` or `qa-framework-improvements` and on all pull requests to `main`.

```
push / PR
    │
    ├── test (chromium) ──────────────────────────┐
    │   setup → UI tests → upload artifacts       │
    │                                             ├── allure-report
    └── test (api) ───────────────────────────────┘
        setup → API tests → upload artifacts
```

Matrix parallelisation runs chromium and API tests simultaneously on separate runners, cutting total CI time roughly in half.

### Required GitHub secrets

Add these in **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `ORANGE_USERNAME` | `Admin` |
| `ORANGE_PASSWORD` | `admin123` |

### Artifacts produced per run

| Artifact | Retention | Contents |
|---|---|---|
| `playwright-report-{project}` | 30 days | Playwright HTML report with trace viewer |
| `allure-results-{project}` | 7 days | Raw Allure data |
| `allure-report` | 30 days | Merged Allure HTML report (both projects) |
| `test-artifacts-{project}` | 7 days | Traces, screenshots, videos (failure only) |

### Manual trigger with tag filter

The workflow supports `workflow_dispatch` with an optional tag input, letting you run just smoke tests from the GitHub Actions UI:

```
tags: @smoke
```

---

## Test Coverage

| Module | Tests | Tags |
|---|---|---|
| Authentication | 6 | `@smoke @auth @regression` |
| Admin – User Management | 6 | `@admin @smoke @regression` |
| Dashboard | 5 | `@dashboard @smoke` |
| PIM – Employee Management | 4 | `@pim @smoke @regression` |
| Leave | 4 | `@leave @smoke @regression` |
| API – Authenticated Endpoints | 6 | `@api @smoke @regression` |
| Visual Regression | 2 | `@visual` |
| **Total** | **33** | |

> The "apply for leave" test gracefully skips when the shared demo has no leave balance configured, rather than failing the run.

---

## Reporting

### Playwright HTML report

```bash
npm test
npm run report:html
```

Opens an interactive report with per-test traces, screenshots, and video recordings for failures.

### Allure report

```bash
npm test
npm run allure:generate
npm run allure:open
```

Produces a rich HTML dashboard with step-level detail, attachments, and tag breakdowns. In CI the report is generated automatically and uploaded as an artifact after every run.
