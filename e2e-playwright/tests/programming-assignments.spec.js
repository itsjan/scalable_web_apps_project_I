const { test, expect } = require("@playwright/test");

// check the page URL
test("User is redirected to the correct URL", async ({ page }) => {
  await page.goto("/");
  const url = page.url();
  expect(url).toMatch(/http:\/\/localhost:7800\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/\d+/);
});


