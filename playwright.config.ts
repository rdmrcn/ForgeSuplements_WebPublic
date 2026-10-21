import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 4318);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: `http://localhost:${port}`,
    // System Chrome is used by default; set PW_CHANNEL= (empty) to use Playwright's bundled Chromium.
    channel: process.env.PW_CHANNEL ?? "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", testIgnore: /mobile\.spec\.ts/, use: { ...devices["Desktop Chrome"], channel: process.env.PW_CHANNEL ?? "chrome" } },
    {
      name: "mobile",
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices["Pixel 7"], channel: process.env.PW_CHANNEL ?? "chrome" },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 240_000,
    env: { ORDER_STORE_PATH: ".data/e2e-orders.json" },
  },
});
