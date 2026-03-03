# Enterprise Web Automation Framework

A robust, highly scalable end-to-end testing framework built from the ground up using **Playwright** and **TypeScript**.

This repository serves as a portfolio piece demonstrating advanced automation strategies, including a strict Page Object Model (POM), custom fixtures, data-driven testing, and environment variable management. The framework runs against the [OrangeHRM Open Source Demo](https://opensource-demo.orangehrmlive.com/).

## 🏗️ Architecture & Design Patterns

- **TypeScript:** For strong typing, better IDE support, and catching errors at compile time.
- **Page Object Model (POM):** UI locators and page actions are strictly separated from test logic to ensure maximum maintainability.
- **Custom Fixtures:** Page objects are injected directly into tests via Playwright fixtures, eliminating the need for repetitive instantiation (`new LoginPage(page)`) in every spec.
- **Data-Driven Testing (DDT):** Test data (like invalid login scenarios) is decoupled from the specs and driven by JSON files.
- **Environment Management:** Sensitive credentials are managed via `dotenv`, keeping secrets out of the codebase.

## 📂 Project Structure

- 📁 **fixtures/** — Custom Playwright test runner extensions for POM injection
- 📁 **page-objects/** — Encapsulated UI locators and page actions
- 📁 **test-data/** — JSON files for data-driven testing (DDT)
- 📁 **tests/** — The actual end-to-end spec files
- 📄 **playwright.config.ts** — Global framework configuration and browser matrix
- 📄 **.env** — Local environment variables (Gitignored for security)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Install Playwright browsers:
   \`\`\`bash
   npx playwright install --with-deps chromium
   \`\`\`

### Environment Setup

Create a `.env` file in the root directory and add the following credentials (required for the OrangeHRM demo site):

\`\`\`env
ORANGE_USERNAME=Admin
ORANGE_PASSWORD=admin123
\`\`\`

## 🧪 Running the Tests

**Run all tests in headless mode (Chromium):**
\`\`\`bash
npx playwright test --project=chromium
\`\`\`

**Run tests with the Playwright UI (Recommended for debugging):**
\`\`\`bash
npx playwright test --ui
\`\`\`

**View the HTML Report after a test run:**
\`\`\`bash
npx playwright show-report
\`\`\`
