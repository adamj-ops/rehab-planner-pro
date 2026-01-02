import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response, "expected a response for /").toBeTruthy();
  expect(response!.status(), "expected 2xx/3xx status for /").toBeLessThan(400);
});

