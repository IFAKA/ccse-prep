import { defineConfig } from "@playwright/test";

export default defineConfig({
  testMatch: ["tests/ui.spec.ts", "tests/e2e/**/*.spec.ts"],
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    browserName: "chromium",
  },
});
