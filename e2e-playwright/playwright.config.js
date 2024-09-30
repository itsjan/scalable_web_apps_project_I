// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  expect: { timeout: 10000 },
  timeout: 60000,
  retries: 0,
  reporter: "list",
  workers: 5,
  use: {
    baseURL: "http://localhost:7800",
    headless: true,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "e2e-headless-chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
});
