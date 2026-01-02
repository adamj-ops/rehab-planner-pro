import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/integration",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    // Provide safe defaults so the app can start in CI without real secrets.
    command:
      "NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-anon-key " +
      "SUPABASE_SERVICE_ROLE_KEY=dummy-service-role-key " +
      "npm run start -- -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

