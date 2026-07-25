import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3017",
    trace: "on-first-retry"
  },
  webServer: {
    command: "./node_modules/.bin/next dev --hostname 127.0.0.1 --port 3017",
    url: "http://127.0.0.1:3017/es/profesional",
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ]
});
