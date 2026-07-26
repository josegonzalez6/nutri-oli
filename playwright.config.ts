import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3017";
const webServerCommand =
  process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ??
  "./node_modules/.bin/next start --hostname 127.0.0.1 --port 3017";

export default defineConfig({
  testDir: "./src/test/e2e",
  timeout: process.env.NEXT_PUBLIC_SUPABASE_URL ? 90_000 : 30_000,
  expect: {
    timeout: process.env.NEXT_PUBLIC_SUPABASE_URL ? 20_000 : 5_000
  },
  workers: process.env.NEXT_PUBLIC_SUPABASE_URL ? 1 : undefined,
  use: {
    baseURL,
    trace: "on-first-retry"
  },
  webServer: {
    command: webServerCommand,
    url: `${baseURL}/es/profesional`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ]
});
