import { test } from "@playwright/test";

test("test", async ({ page }) => {
  const site = "https://google.com";
  await page.goto(site);
});
